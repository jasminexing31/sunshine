'use server';

import { prisma } from '@/lib/prisma';
import { generateSchedule } from '@/lib/scheduling';
import { getLessonTimeWindow, overlaps, hasNarrowGap } from '@/lib/timeUtils';
import { revalidatePath } from 'next/cache';

export async function generateWeekSchedule(weekStartDateStr: string) {
  const weekStartDate = new Date(weekStartDateStr);

  // Get end of week
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 7);

  // Fetch lessons for the week
  const lessons = await prisma.lesson.findMany({
    where: {
      weekStartDate: weekStartDate,
    },
    include: {
      requestedInstructor: true,
    },
  });

  // Fetch active instructors with their days off
  const instructors = await prisma.instructor.findMany({
    where: { isActive: true },
    include: {
      daysOff: {
        where: {
          date: {
            gte: weekStartDate,
            lt: weekEndDate,
          },
        },
      },
    },
  });

  // Run scheduling algorithm
  const result = generateSchedule(lessons, instructors, weekStartDate);

  // Clear existing assignments and rosters for this week
  await prisma.assignment.deleteMany({
    where: {
      lesson: {
        weekStartDate: weekStartDate,
      },
    },
  });

  await prisma.dayRoster.deleteMany({
    where: {
      date: {
        gte: weekStartDate,
        lt: weekEndDate,
      },
    },
  });

  // Save new assignments
  for (const assignment of result.assignments) {
    if (assignment.instructorId === 0) continue; // skip unresolved
    await prisma.assignment.create({
      data: {
        lessonId: assignment.lessonId,
        instructorId: assignment.instructorId,
        status: assignment.status,
        warningMsg: assignment.warningMsg,
      },
    });
  }

  // Save unresolved as special assignments (instructorId = first active instructor as placeholder)
  // Actually, for unresolved we won't create an assignment — they'll show as unassigned in the UI

  // Save day rosters
  for (const roster of result.dayRosters) {
    await prisma.dayRoster.upsert({
      where: {
        date_instructorId: {
          date: roster.date,
          instructorId: roster.instructorId,
        },
      },
      update: { status: roster.status },
      create: {
        date: roster.date,
        instructorId: roster.instructorId,
        status: roster.status,
      },
    });
  }

  // Ensure WeekSchedule record exists
  await prisma.weekSchedule.upsert({
    where: { weekStartDate },
    update: { status: 'draft', updatedAt: new Date() },
    create: { weekStartDate, status: 'draft' },
  });

  revalidatePath('/schedule');
  return { success: true, assignmentCount: result.assignments.length };
}

export async function overrideAssignment(lessonId: number, newInstructorId: number) {
  // Check for conflicts with the new instructor on that day
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new Error('Lesson not found');

  // Get all assignments for this instructor on this day
  const sameDay = new Date(lesson.date);
  const nextDay = new Date(sameDay);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingAssignments = await prisma.assignment.findMany({
    where: {
      instructorId: newInstructorId,
      lesson: {
        date: { gte: sameDay, lt: nextDay },
        id: { not: lessonId },
      },
    },
    include: { lesson: true },
  });

  // Determine status
  let status = 'assigned';
  let warningMsg: string | undefined;

  // Simple conflict check by time windows
  const lessonWindow = getLessonTimeWindow(lesson.format, lesson.startTime);

  for (const other of existingAssignments) {
    const otherWindow = getLessonTimeWindow(other.lesson.format, other.lesson.startTime);
    if (overlaps(lessonWindow, otherWindow)) {
      status = 'conflict';
      warningMsg = 'Time conflict with another assignment';
      break;
    }
    if (hasNarrowGap(lessonWindow, otherWindow, 15)) {
      status = 'warning';
      warningMsg = 'Less than 15 min gap between lessons';
    }
  }

  // Upsert assignment
  await prisma.assignment.upsert({
    where: { lessonId },
    update: {
      instructorId: newInstructorId,
      status,
      warningMsg: warningMsg ?? null,
      updatedAt: new Date(),
    },
    create: {
      lessonId,
      instructorId: newInstructorId,
      status,
      warningMsg: warningMsg ?? null,
    },
  });

  revalidatePath('/schedule');
  return { success: true };
}

export async function publishWeekSchedule(weekStartDateStr: string) {
  const weekStartDate = new Date(weekStartDateStr);

  await prisma.weekSchedule.upsert({
    where: { weekStartDate },
    update: { status: 'published', publishedAt: new Date(), updatedAt: new Date() },
    create: { weekStartDate, status: 'published', publishedAt: new Date() },
  });

  revalidatePath('/schedule');
  revalidatePath('/history');
  return { success: true };
}
