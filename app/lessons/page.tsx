import { prisma } from '@/lib/prisma';
import { format, startOfWeek } from 'date-fns';
import LessonsClient from './LessonsClient';

export const dynamic = 'force-dynamic';

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const weekStartParam = searchParams.week;
  // new Date("yyyy-MM-dd") parses as UTC midnight, matching how dates are stored in the DB.
  // startOfWeek() returns local midnight, so normalize it via format() to get the correct UTC midnight.
  const weekStart = weekStartParam
    ? new Date(weekStartParam)
    : new Date(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));

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
