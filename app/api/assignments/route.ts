import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get('weekStart');

  try {
    const where = weekStart
      ? { lesson: { weekStartDate: new Date(weekStart) } }
      : {};

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        lesson: true,
        instructor: true,
      },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}
