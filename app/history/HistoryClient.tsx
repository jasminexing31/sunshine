'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Clock, Eye, ArrowLeft, Calendar } from 'lucide-react';
import ScheduleGrid from '@/components/ScheduleGrid';
import StatusBadge from '@/components/StatusBadge';

interface WeekSchedule {
  id: number;
  weekStartDate: Date | string;
  status: string;
  publishedAt?: Date | null;
  createdAt: Date | string;
}

interface Instructor {
  id: number;
  name: string;
  certificationLevel: number;
}

interface Lesson {
  id: number;
  date: Date | string;
  discipline: string;
  program: string;
  format: string;
  skillLevel?: string | null;
  startTime?: string | null;
}

interface Assignment {
  id: number;
  lessonId: number;
  instructorId: number;
  status: string;
  warningMsg?: string | null;
  lesson: Lesson;
  instructor: Instructor;
}

interface DayRoster {
  date: Date | string;
  instructorId: number;
  status: string;
}

interface ViewData {
  assignments: Assignment[];
  dayRosters: DayRoster[];
  instructors: Instructor[];
  schedule: WeekSchedule | null;
  weekDays: Date[];
  weekStartDate: Date;
}

interface HistoryClientProps {
  publishedSchedules: WeekSchedule[];
  viewData: ViewData | null;
  currentView: string | null;
}

export default function HistoryClient({
  publishedSchedules,
  viewData,
  currentView,
}: HistoryClientProps) {
  const router = useRouter();

  if (currentView && viewData) {
    return (
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </button>
          <div className="w-px h-5 bg-navy-600" />
          <div>
            <h1 className="text-xl font-bold text-white">
              Week of {format(new Date(viewData.weekStartDate), 'MMM d, yyyy')}
            </h1>
            {viewData.schedule?.publishedAt && (
              <p className="text-xs text-slate-500 mt-0.5">
                Published {format(new Date(viewData.schedule.publishedAt), 'MMM d, yyyy \'at\' h:mm a')}
              </p>
            )}
          </div>
          <div className="ml-auto">
            <StatusBadge status="published" size="md" />
          </div>
        </div>

        {/* Read-only grid */}
        <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-600">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Published Schedule — Read Only
            </span>
          </div>
          <ScheduleGrid
            instructors={viewData.instructors}
            weekDays={viewData.weekDays}
            assignments={viewData.assignments}
            dayRosters={viewData.dayRosters}
            readOnly={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Schedule History</h1>
        <p className="text-slate-400 text-sm mt-1">
          {publishedSchedules.length} published schedule{publishedSchedules.length !== 1 ? 's' : ''}
        </p>
      </div>

      {publishedSchedules.length === 0 ? (
        <div className="bg-navy-800 border border-navy-600 rounded-xl flex flex-col items-center justify-center py-16 gap-3">
          <Clock className="w-10 h-10 text-navy-600" />
          <p className="text-slate-500 font-mono text-sm">No published schedules yet</p>
          <p className="text-slate-600 text-xs">
            Generate and publish a schedule from the Schedule page to see it here.
          </p>
        </div>
      ) : (
        <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600">
                <th className="px-5 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Week</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Published</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-mono text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {publishedSchedules.map((schedule, idx) => {
                const weekEnd = new Date(schedule.weekStartDate);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return (
                  <tr
                    key={schedule.id}
                    className={`border-b border-navy-700/50 hover:bg-navy-700/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-navy-700/10'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-ice-500" />
                        <span className="text-sm font-semibold text-white font-mono">
                          {format(new Date(schedule.weekStartDate), 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-400 font-mono">
                        {schedule.publishedAt
                          ? format(new Date(schedule.publishedAt), 'MMM d, yyyy')
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={schedule.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() =>
                          router.push(
                            `/history?view=${format(new Date(schedule.weekStartDate), 'yyyy-MM-dd')}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-navy-700 hover:bg-navy-600 border border-navy-600 hover:border-navy-500 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
