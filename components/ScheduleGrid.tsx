'use client';

import { format } from 'date-fns';
import { formatLabel, certLevelLabel, skillLevelLabel } from '@/lib/certUtils';
import { getLessonTimeWindow, formatTime } from '@/lib/timeUtils';
import { Snowflake, Edit2 } from 'lucide-react';

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

interface ScheduleGridProps {
  instructors: Instructor[];
  weekDays: Date[];
  assignments: Assignment[];
  dayRosters: DayRoster[];
  onOverride?: (assignment: Assignment, day: Date) => void;
  readOnly?: boolean;
}

function isSameDay(a: Date | string, b: Date): boolean {
  // a comes from the DB as UTC midnight; compare its UTC components
  // against b's local components (b is local midnight from the client).
  const da = new Date(a);
  return (
    da.getUTCFullYear() === b.getFullYear() &&
    da.getUTCMonth() === b.getMonth() &&
    da.getUTCDate() === b.getDate()
  );
}

const statusCardClass: Record<string, string> = {
  assigned: 'status-assigned border',
  warning: 'status-warning border',
  conflict: 'status-conflict border',
  unresolved: 'status-unresolved border',
  'not-needed': 'status-not-needed border',
};

function LessonCard({
  assignment,
  onOverride,
  readOnly,
}: {
  assignment: Assignment;
  onOverride?: () => void;
  readOnly?: boolean;
}) {
  const lesson = assignment.lesson;
  const window = getLessonTimeWindow(lesson.format, lesson.startTime);
  const cardClass = statusCardClass[assignment.status] ?? 'bg-navy-700 border border-navy-600';

  return (
    <div
      className={`group relative rounded-md px-2 py-1.5 text-xs font-mono leading-tight ${cardClass} ${!readOnly && assignment.status !== 'unresolved' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={() => !readOnly && onOverride?.()}
    >
      {!readOnly && onOverride && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="w-2.5 h-2.5" />
        </div>
      )}
      <div className="font-semibold truncate">
        {formatLabel(lesson.format)}
      </div>
      <div className="text-[10px] opacity-75">
        {lesson.discipline.toUpperCase()} · {lesson.program.toUpperCase()}
      </div>
      {lesson.skillLevel && (
        <div className="text-[10px] opacity-60 truncate">{skillLevelLabel(lesson.skillLevel)}</div>
      )}
      <div className="text-[10px] opacity-60">
        {formatTime(window.start)}–{formatTime(window.end)}
      </div>
      {assignment.warningMsg && (
        <div className="text-[10px] mt-0.5 opacity-80 truncate" title={assignment.warningMsg}>
          ⚠ {assignment.warningMsg}
        </div>
      )}
    </div>
  );
}

export default function ScheduleGrid({
  instructors,
  weekDays,
  assignments,
  dayRosters,
  onOverride,
  readOnly = false,
}: ScheduleGridProps) {
  if (instructors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Snowflake className="w-12 h-12 text-ice-500/30 mb-4" />
        <p className="text-slate-500 font-mono">No instructors in roster</p>
      </div>
    );
  }

  const getDayRoster = (instructorId: number, day: Date): string | null => {
    const roster = dayRosters.find(
      (r) => r.instructorId === instructorId && isSameDay(r.date, day)
    );
    return roster?.status ?? null;
  };

  const getDayAssignments = (instructorId: number, day: Date): Assignment[] => {
    return assignments.filter(
      (a) => a.instructorId === instructorId && isSameDay(a.lesson.date, day)
    );
  };

  const hasSchedule = assignments.length > 0 || dayRosters.length > 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
        <thead>
          <tr>
            {/* Instructor header */}
            <th className="sticky left-0 z-10 bg-navy-800 border-b border-r border-navy-600 px-4 py-3 text-left w-48">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Instructor</span>
            </th>
            {weekDays.map((day) => (
              <th
                key={day.toISOString()}
                className="border-b border-r border-navy-600 px-3 py-3 text-left min-w-[140px]"
              >
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {format(day, 'EEE')}
                </div>
                <div className="text-sm font-semibold text-white font-mono">
                  {format(day, 'MMM d')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {instructors.map((instructor, idx) => (
            <tr
              key={instructor.id}
              className={idx % 2 === 0 ? 'bg-navy-900/60' : 'bg-navy-800/40'}
            >
              {/* Instructor name column — sticky */}
              <td className="sticky left-0 z-10 bg-inherit border-b border-r border-navy-600/50 px-4 py-3">
                <div className="font-semibold text-sm text-white truncate max-w-[160px]">{instructor.name}</div>
                <div className="text-xs font-mono text-ice-500/70">
                  {certLevelLabel(instructor.certificationLevel)}
                </div>
              </td>

              {weekDays.map((day) => {
                const rosterStatus = hasSchedule ? getDayRoster(instructor.id, day) : null;
                const dayAssignments = hasSchedule ? getDayAssignments(instructor.id, day) : [];

                return (
                  <td
                    key={day.toISOString()}
                    className="border-b border-r border-navy-600/30 px-2 py-2 align-top"
                  >
                    {!hasSchedule ? (
                      <div className="h-8 flex items-center">
                        <span className="text-xs text-slate-700 font-mono">—</span>
                      </div>
                    ) : rosterStatus === 'off' ? (
                      <div className="rounded-md px-2 py-1.5 bg-navy-700/50 border border-navy-600/50 text-xs font-mono text-slate-600">
                        Day Off
                      </div>
                    ) : dayAssignments.length > 0 ? (
                      <div className="space-y-1">
                        {dayAssignments.map((a) => (
                          <LessonCard
                            key={a.id}
                            assignment={a}
                            readOnly={readOnly}
                            onOverride={() => onOverride?.(a, day)}
                          />
                        ))}
                      </div>
                    ) : rosterStatus === 'not-needed' ? (
                      <div className="rounded-md px-2 py-1.5 border border-dashed border-slate-700/50 text-xs font-mono text-slate-600">
                        Not Needed
                      </div>
                    ) : (
                      <div className="h-8 flex items-center">
                        <span className="text-xs text-slate-700 font-mono">—</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {!hasSchedule && (
        <div className="mt-8 flex flex-col items-center gap-2 py-8 text-center">
          <Snowflake className="w-10 h-10 text-ice-500/20" />
          <p className="text-slate-500 text-sm font-mono">No schedule generated yet — click Generate Schedule to begin</p>
        </div>
      )}
    </div>
  );
}
