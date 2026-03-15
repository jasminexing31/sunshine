'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addLesson(data: {
  date: string;
  discipline: string;
  program: string;
  format: string;
  skillLevel?: string | null;
  startTime?: string | null;
  requestedInstructorId?: number | null;
  weekStartDate: string;
}) {
  const lesson = await prisma.lesson.create({
    data: {
      date: new Date(data.date),
      discipline: data.discipline,
      program: data.program,
      format: data.format,
      skillLevel: data.skillLevel,
      startTime: data.startTime,
      requestedInstructorId: data.requestedInstructorId,
      weekStartDate: new Date(data.weekStartDate),
    },
  });
  revalidatePath('/lessons');
  return lesson;
}

export async function deleteLesson(id: number) {
  await prisma.lesson.delete({ where: { id } });
  revalidatePath('/lessons');
  revalidatePath('/schedule');
}
