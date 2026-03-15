'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addWeeks, subWeeks } from 'date-fns';
import { Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import WeekPicker from '@/components/WeekPicker';
import LessonForm from '@/components/LessonForm';
import StatusBadge from '@/components/StatusBadge';
import { deleteLesson } from '@/app/actions/lessons';
import { formatLabel, skillLevelLabel } from '@/lib/certUtils';
import { getLessonTimeWindow, formatTime } from '@/lib/timeUtils';

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
  requestedInstructor?: Instructor | null;
  assignment?: {
    id: number;
    status: string;
    warningMsg?: string | null;
    instructor: Instructor;
  } | null;
}

interface LessonsClientProps {
  lessons: Lesson[];
  instructors: Instructor[];
  weekStart: Date;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function LessonsClient({ lessons, instructors, weekStart }: LessonsClientProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const weekDays = getWeekDays(weekStart);

  const handleWeekChange = (newWeek: Date) => {
    router.push(`/lessons?week=${format(newWeek, 'yyyy-MM-dd')}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lesson?')) return;
    setDeletingId(id);
    try {
      await deleteLesson(id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const lessonsByDay = weekDays.map((day) => ({
    day,
    lessons: lessons.filter((l) => {
      const d = new Date(l.date);
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate()
      );
    }),
  }));

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Lesson Input</h1>
          <p className="text-slate-400 text-sm mt-1">
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} this week
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ice-500 hover:bg-ice-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </button>
      </div>

      {/* Week picker */}
      <div className="mb-6">
        <WeekPicker weekStart={weekStart} onChange={handleWeekChange} />
      </div>

      {/* Lessons grid by day */}
      {lessons.length === 0 ? (
        <div className="bg-navy-800 border border-navy-600 rounded-xl flex flex-col items-center justify-center py-16 gap-3">
          <BookOpen className="w-10 h-10 text-navy-600" />
          <p className="text-slate-500 font-mono text-sm">No lessons entered for this week</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 flex items-center gap-2 px-3 py-1.5 text-xs text-ice-400 hover:text-ice-300 border border-ice-500/20 hover:border-ice-500/40 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add first lesson
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessonsByDay.map(({ day, lessons: dayLessons }) => {
            if (dayLessons.length === 0) return null;
            return (
              <div key={day.toISOString()} className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
                {/* Day header */}
                <div className="px-5 py-3 border-b border-navy-700 bg-navy-700/50 flex items-center gap-3">
                  <div className="text-sm font-semibold text-white font-mono">
                    {format(day, 'EEEE')}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{format(day, 'MMM d, yyyy')}</div>
                  <div className="ml-auto text-xs text-slate-500 font-mono">
                    {dayLessons.length} lesson{dayLessons.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Lessons table */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-700/50">
                      <th className="px-5 py-2 text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">Format</th>
                      <th className="px-4 py-2 text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">Discipline</th>
                      <th className="px-4 py-2 text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">Program</th>
                      <th className="px-4 py-2 text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">Skill Level</th>
                      <th className="px-4 py-2 text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-2 text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">Requested</th>
                      <th className="px-4 py-2 text-left text-[11px] font-mono text-slate-500 uppercase tracking-wider">Assigned</th>
                      <th className="px-4 py-2 text-right text-[11px] font-mono text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayLessons.map((lesson, idx) => {
                      const window = getLessonTimeWindow(lesson.format, lesson.startTime);
                      return (
                        <tr
                          key={lesson.id}
                          className={`border-b border-navy-700/30 hover:bg-navy-700/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-navy-700/10'}`}
                        >
                          <td className="px-5 py-3 text-sm font-mono text-white">
                            {formatLabel(lesson.format)}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-300 uppercase">
                            {lesson.discipline}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-300 uppercase">
                            {lesson.program}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {lesson.skillLevel ? skillLevelLabel(lesson.skillLevel) : <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-400">
                            {formatTime(window.start)}–{formatTime(window.end)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {lesson.requestedInstructor
                              ? <span className="text-ice-400">{lesson.requestedInstructor.name}</span>
                              : <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {lesson.assignment ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-200">{lesson.assignment.instructor.name}</span>
                                <StatusBadge status={lesson.assignment.status} />
                              </div>
                            ) : (
                              <span className="text-xs text-slate-600 font-mono">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(lesson.id)}
                              disabled={deletingId === lesson.id}
                              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Show days with no lessons as empty sections */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {lessonsByDay.map(({ day, lessons: dayLessons }) => {
              if (dayLessons.length > 0) return null;
              return (
                <div
                  key={day.toISOString()}
                  className="bg-navy-800/50 border border-dashed border-navy-700 rounded-lg p-3 text-center"
                >
                  <div className="text-xs font-mono text-slate-600 uppercase">{format(day, 'EEE')}</div>
                  <div className="text-xs text-slate-700 mt-0.5">{format(day, 'MMM d')}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add lesson modal */}
      {showAddForm && (
        <LessonForm
          weekStart={weekStart}
          weekDays={weekDays}
          instructors={instructors}
          onClose={() => setShowAddForm(false)}
          onSaved={() => {
            setShowAddForm(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
