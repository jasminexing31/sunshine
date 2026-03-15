'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle, Check, Shield } from 'lucide-react';
import { formatLabel, certLevelLabel, skillLevelLabel, isQualified } from '@/lib/certUtils';
import { getLessonTimeWindow, formatTime, overlaps } from '@/lib/timeUtils';
import { format } from 'date-fns';

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
}

interface OtherAssignment {
  instructorId: number;
  lesson: Lesson;
}

interface OverrideModalProps {
  assignment: Assignment;
  instructors: Instructor[];
  allAssignments: OtherAssignment[];
  onClose: () => void;
  onOverride: (lessonId: number, newInstructorId: number) => Promise<void>;
}

export default function OverrideModal({
  assignment,
  instructors,
  allAssignments,
  onClose,
  onOverride,
}: OverrideModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const lesson = assignment.lesson;
  const lessonWindow = getLessonTimeWindow(lesson.format, lesson.startTime);

  function getInstructorStatus(instructor: Instructor): {
    qualified: boolean;
    hasConflict: boolean;
    conflictLesson?: Lesson;
  } {
    const qualified = isQualified(instructor.certificationLevel, lesson.format, lesson.skillLevel);

    // Check conflicts with this instructor's other assignments on same day
    const sameDay = allAssignments.filter((a) => {
      if (a.instructorId !== instructor.id) return false;
      if (a.lesson.id === lesson.id) return false;
      const ad = new Date(a.lesson.date);
      const ld = new Date(lesson.date);
      return (
        ad.getFullYear() === ld.getFullYear() &&
        ad.getMonth() === ld.getMonth() &&
        ad.getDate() === ld.getDate()
      );
    });

    for (const other of sameDay) {
      const otherWindow = getLessonTimeWindow(other.lesson.format, other.lesson.startTime);
      if (overlaps(lessonWindow, otherWindow)) {
        return { qualified, hasConflict: true, conflictLesson: other.lesson };
      }
    }

    return { qualified, hasConflict: false };
  }

  const handleOverride = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await onOverride(lesson.id, selectedId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-navy-800 border border-navy-600 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600">
          <div>
            <h2 className="text-base font-semibold text-white">Override Assignment</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {format(new Date(lesson.date), 'EEE MMM d')} · {formatLabel(lesson.format)}
              {lesson.skillLevel && ` · ${skillLevelLabel(lesson.skillLevel)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lesson time */}
        <div className="px-5 py-3 bg-navy-700/50 border-b border-navy-600 text-xs font-mono text-slate-400">
          Time window: {formatTime(lessonWindow.start)} – {formatTime(lessonWindow.end)}
        </div>

        {/* Instructor list */}
        <div className="px-5 py-3 max-h-80 overflow-y-auto space-y-1">
          {instructors.map((inst) => {
            const { qualified, hasConflict, conflictLesson } = getInstructorStatus(inst);
            const isCurrent = inst.id === assignment.instructorId;
            const isSelected = inst.id === selectedId;

            return (
              <button
                key={inst.id}
                disabled={!qualified}
                onClick={() => setSelectedId(inst.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-ice-500/15 border-ice-500/40 text-white'
                    : qualified
                    ? 'bg-navy-700/50 border-navy-600 hover:border-ice-500/30 hover:bg-navy-700 text-slate-200'
                    : 'bg-navy-700/20 border-navy-700 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{inst.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ice-500/20 text-ice-400">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {certLevelLabel(inst.certificationLevel)}
                    {hasConflict && conflictLesson && (
                      <span className="text-amber-400 ml-2">
                        · Conflicts w/ {formatLabel(conflictLesson.format)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {!qualified ? (
                    <Shield className="w-4 h-4 text-slate-600" />
                  ) : hasConflict ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : isSelected ? (
                    <Check className="w-4 h-4 text-ice-400" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-navy-600 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            onClick={handleOverride}
            disabled={!selectedId || loading}
            className="px-4 py-2 text-sm font-semibold bg-ice-500 hover:bg-ice-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Apply Override'}
          </button>
        </div>
      </div>
    </div>
  );
}
