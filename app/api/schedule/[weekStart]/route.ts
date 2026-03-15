import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { weekStart: string } }
) {
  try {
    const weekStartDate = new Date(params.weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const [assignments, dayRosters, weekSchedule, instructors, lessons] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          lesson: { weekStartDate: weekStartDate },
        },
        include: {
          lesson: true,
          instructor: true,
        },
      }),
      prisma.dayRoster.findMany({
        where: {
          date: { gte: weekStartDate, lt: weekEndDate },
        },
        include: { instructor: true },
      }),
      prisma.weekSchedule.findUnique({
        where: { weekStartDate },
      }),
      prisma.instructor.findMany({
        where: { isActive: true },
        orderBy: [{ certificationLevel: 'desc' }, { name: 'asc' }],
      }),
      prisma.lesson.findMany({
        where: { weekStartDate: weekStartDate },
        include: {
          requestedInstructor: true,
          assignment: { include: { instructor: true } },
        },
        orderBy: [{ date: 'asc' }],
      }),
    ]);

    return NextResponse.json({
      assignments,
      dayRosters,
      weekSchedule,
      instructors,
      lessons,
    });
  } catch (error) {
    console.error('Schedule fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}
