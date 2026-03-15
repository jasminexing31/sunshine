import { prisma } from '@/lib/prisma';
import RosterClient from './RosterClient';

export const dynamic = 'force-dynamic';

export default async function RosterPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: [{ isActive: 'desc' }, { certificationLevel: 'desc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { assignments: true, daysOff: true },
      },
    },
  });

  return <RosterClient instructors={instructors} />;
}
