import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get('weekStart');

  try {
    const where = weekStart
      ? { weekStartDate: new Date(weekStart) }
      : {};

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        requestedInstructor: true,
        assignment: {
          include: { instructor: true },
        },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}
