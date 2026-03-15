import { prisma } from '@/lib/prisma';
import { startOfWeek } from 'date-fns';
import LessonsClient from './LessonsClient';

export const dynamic = 'force-dynamic';

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const weekStartParam = searchParams.week;
  const weekStart = weekStartParam
    ? new Date(weekStartParam)
    : startOfWeek(new Date(), { weekStartsOn: 1 });

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [lessons, instructors] = await Promise.all([
    prisma.lesson.findMany({
      where: { weekStartDate: weekStart },
      include: {
        requestedInstructor: true,
        assignment: { include: { instructor: true } },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.instructor.findMany({
      where: { isActive: true },
      orderBy: [{ certificationLevel: 'desc' }, { name: 'asc' }],
    }),
  ]);

  return (
    <LessonsClient
      lessons={lessons}
      instructors={instructors}
      weekStart={weekStart}
    />
  );
}
