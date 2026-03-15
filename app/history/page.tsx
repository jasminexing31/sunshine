import { prisma } from '@/lib/prisma';
import HistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const viewWeek = searchParams.view;

  const publishedSchedules = await prisma.weekSchedule.findMany({
    where: { status: 'published' },
    orderBy: { weekStartDate: 'desc' },
  });

  let viewData = null;
  if (viewWeek) {
    const weekStartDate = new Date(viewWeek);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const [assignments, dayRosters, instructors, schedule] = await Promise.all([
      prisma.assignment.findMany({
        where: { lesson: { weekStartDate: weekStartDate } },
        include: { lesson: true, instructor: true },
      }),
      prisma.dayRoster.findMany({
        where: { date: { gte: weekStartDate, lt: weekEndDate } },
        include: { instructor: true },
      }),
      prisma.instructor.findMany({
        orderBy: [{ certificationLevel: 'desc' }, { name: 'asc' }],
      }),
      prisma.weekSchedule.findUnique({ where: { weekStartDate: weekStartDate } }),
    ]);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      return d;
    });

    viewData = { assignments, dayRosters, instructors, schedule, weekDays, weekStartDate };
  }

  return (
    <HistoryClient
      publishedSchedules={publishedSchedules}
      viewData={viewData}
      currentView={viewWeek ?? null}
    />
  );
}
