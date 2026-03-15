import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: [{ isActive: 'desc' }, { certificationLevel: 'desc' }, { name: 'asc' }],
    });
    return NextResponse.json(instructors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch instructors' }, { status: 500 });
  }
}
