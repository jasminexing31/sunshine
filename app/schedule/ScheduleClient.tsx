'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Zap, Globe, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import WeekPicker from '@/components/WeekPicker';
import ScheduleGrid from '@/components/ScheduleGrid';
import OverrideModal from '@/components/OverrideModal';
import ConflictPanel from '@/components/ConflictPanel';
import StatusBadge from '@/components/StatusBadge';
import { generateWeekSchedule, overrideAssignment, publishWeekSchedule } from '@/app/actions/schedule';

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

interface WeekSchedule {
  id: number;
  weekStartDate: Date | string;
  status: string;
  publishedAt?: Date | null;
}

interface ScheduleClientProps {
  instructors: Instructor[];
  weekStart: Date;
  weekDays: Date[];
  assignments: Assignment[];
  dayRosters: DayRoster[];
  weekSchedule: WeekSchedule | null;
  lessons: Lesson[];
}

export default function ScheduleClient({
  instructors,
  weekStart,
  weekDays,
  assignments,
  dayRosters,
  weekSchedule,
  lessons,
}: ScheduleClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState<Assignment | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // weekStart and weekDays arrive from the server as UTC midnight. Convert to local
  // midnight so date-fns formatting and display work correctly in the browser's timezone.
  const weekStartLocal = new Date(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate());
  const weekDaysLocal = weekDays.map((d) => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  const handleWeekChange = (newWeek: Date) => {
    router.push(`/schedule?week=${format(newWeek, 'yyyy-MM-dd')}`);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setActionMsg(null);
    try {
      await generateWeekSchedule(format(weekStartLocal, 'yyyy-MM-dd'));
      setActionMsg({ type: 'success', text: 'Schedule generated successfully!' });
      router.refresh();
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Failed to generate schedule. Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this schedule? This will make it visible in history.')) return;
    setPublishing(true);
    setActionMsg(null);
    try {
      await publishWeekSchedule(format(weekStartLocal, 'yyyy-MM-dd'));
      setActionMsg({ type: 'success', text: 'Schedule published!' });
      router.refresh();
    } catch (err) {
      setActionMsg({ type: 'error', text: 'Failed to publish schedule.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleOverride = async (lessonId: number, newInstructorId: number) => {
    await overrideAssignment(lessonId, newInstructorId);
    router.refresh();
  };

  // Build conflict panel items (instructor is null for unassigned lessons)
  const conflictItems: Array<{
    lessonId: number;
    status: string;
    warningMsg?: string | null;
    lesson: Lesson;
    instructor: Instructor | null;
  }> = assignments
    .filter((a) => a.status !== 'assigned')
    .map((a) => ({
      lessonId: a.lessonId,
      status: a.status,
      warningMsg: a.warningMsg,
      lesson: a.lesson,
      instructor: a.instructor,
    }));

  // Add unassigned lessons (no assignment record)
  const assignedLessonIds = new Set(assignments.map((a) => a.lessonId));
  const unassignedLessons = lessons.filter((l) => !assignedLessonIds.has(l.id));
  for (const lesson of unassignedLessons) {
    if (assignments.length > 0) {
      // Only show unresolved if schedule has been generated
      conflictItems.push({
        lessonId: lesson.id,
        status: 'unresolved',
        warningMsg: 'No qualified instructor available',
        lesson,
        instructor: null,
      });
    }
  }

  const isPublished = weekSchedule?.status === 'published';
  const hasSchedule = assignments.length > 0 || dayRosters.length > 0;
  const conflictCount = assignments.filter((a) => a.status === 'conflict').length;
  const warningCount = assignments.filter((a) => a.status === 'warning').length;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule Generator</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-slate-400 text-sm">
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} · {instructors.length} instructor{instructors.length !== 1 ? 's' : ''}
            </p>
            {weekSchedule && (
              <StatusBadge status={weekSchedule.status} size="sm" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasSchedule && !isPublished && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              Publish
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || isPublished}
            className="flex items-center gap-2 px-4 py-2 bg-ice-500 hover:bg-ice-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {generating ? 'Generating...' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      {/* Week picker */}
      <div className="mb-6 flex items-center justify-between">
        <WeekPicker weekStart={weekStartLocal} onChange={handleWeekChange} />

        {/* Status summary */}
        {hasSchedule && (
          <div className="flex items-center gap-3 text-xs font-mono">
            {conflictCount > 0 && (
              <span className="flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
            {conflictCount === 0 && warningCount === 0 && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Clean schedule
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action message */}
      {actionMsg && (
        <div
          className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          {actionMsg.text}
        </div>
      )}

      {/* Published banner */}
      {isPublished && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Globe className="w-4 h-4 shrink-0" />
          This schedule was published on{' '}
          {weekSchedule?.publishedAt
            ? format(new Date(weekSchedule.publishedAt), 'MMM d, yyyy \'at\' h:mm a')
            : ''}
          . To make changes, generate a new schedule.
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden mb-6 relative noise-bg">
        <div className="px-5 py-3 border-b border-navy-600 flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Weekly Grid</span>
          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1.5 text-xs font-mono text-ice-400">
              <span className="w-2 h-2 rounded-sm bg-ice-500/40 border border-ice-500/60" />
              Assigned
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
              <span className="w-2 h-2 rounded-sm bg-amber-500/40 border border-amber-500/60" />
              Warning
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono text-red-400">
              <span className="w-2 h-2 rounded-sm bg-red-500/40 border border-red-500/60" />
              Conflict
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-sm bg-slate-700 border border-slate-600" />
              Not Needed
            </span>
          </div>
        </div>

        <ScheduleGrid
          instructors={instructors}
          weekDays={weekDaysLocal}
          assignments={assignments}
          dayRosters={dayRosters}
          onOverride={!isPublished ? (a, _day) => setOverrideTarget(a) : undefined}
          readOnly={isPublished}
        />
      </div>

      {/* Conflicts/Warnings panel */}
      {(hasSchedule || lessons.length > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-3">
            Conflicts & Warnings
          </h2>
          <ConflictPanel items={conflictItems} />
        </div>
      )}

      {/* Override modal */}
      {overrideTarget && (
        <OverrideModal
          assignment={overrideTarget}
          instructors={instructors}
          allAssignments={assignments.map((a) => ({
            instructorId: a.instructorId,
            lesson: a.lesson,
          }))}
          onClose={() => setOverrideTarget(null)}
          onOverride={handleOverride}
        />
      )}
    </div>
  );
}
