import { prisma } from '@/lib/prisma';
import { format, startOfWeek } from 'date-fns';
import ScheduleClient from './ScheduleClient';

export const dynamic = 'force-dynamic';

export default async function SchedulePage({
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

  const [assignments, dayRosters, weekSchedule, instructors, lessons] = await Promise.all([
    prisma.assignment.findMany({
      where: { lesson: { weekStartDate: weekStart } },
      include: { lesson: true, instructor: true },
    }),
    prisma.dayRoster.findMany({
      where: { date: { gte: weekStart, lt: weekEnd } },
      include: { instructor: true },
    }),
    prisma.weekSchedule.findUnique({ where: { weekStartDate: weekStart } }),
    prisma.instructor.findMany({
      where: { isActive: true },
      orderBy: [{ certificationLevel: 'desc' }, { name: 'asc' }],
    }),
    prisma.lesson.findMany({
      where: { weekStartDate: weekStart },
      include: {
        requestedInstructor: true,
        assignment: { include: { instructor: true } },
      },
      orderBy: [{ date: 'asc' }],
    }),
  ]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <ScheduleClient
      instructors={instructors}
      weekStart={weekStart}
      weekDays={weekDays}
      assignments={assignments}
      dayRosters={dayRosters}
      weekSchedule={weekSchedule}
      lessons={lessons}
    />
  );
}
