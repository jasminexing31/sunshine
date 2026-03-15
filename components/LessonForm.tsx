'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { addLesson } from '@/app/actions/lessons';

interface Instructor {
  id: number;
  name: string;
  certificationLevel: number;
}

interface LessonFormProps {
  weekStart: Date;
  weekDays: Date[];
  instructors: Instructor[];
  onClose: () => void;
  onSaved: () => void;
}

const PRIVATE_FORMATS = [
  { value: 'full_day', label: 'Full Day' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'one_hour', label: '1-Hour' },
  { value: 'one_hour_kids', label: '1-Hour (Kids)' },
  { value: 'full_day_delirium', label: 'Full Day — Delirium Dive' },
  { value: 'half_day_delirium', label: 'Half Day — Delirium Dive' },
];

const GROUP_FORMATS = [
  { value: 'full_day', label: 'Full Day' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day_kids', label: 'Full Day (Kids)' },
  { value: 'half_day_kids', label: 'Half Day (Kids)' },
];

const SKILL_LEVELS = [
  { value: 'never_skied', label: 'Never Skied' },
  { value: 'once_or_twice', label: 'Once or Twice' },
  { value: 'green_runner', label: 'Green Runner' },
  { value: 'blue_runner', label: 'Blue Runner' },
  { value: 'black_runner', label: 'Black Runner' },
];

const ONE_HOUR_TIMES = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
];

export default function LessonForm({
  weekStart,
  weekDays,
  instructors,
  onClose,
  onSaved,
}: LessonFormProps) {
  const [date, setDate] = useState(format(weekDays[0], 'yyyy-MM-dd'));
  const [discipline, setDiscipline] = useState('ski');
  const [program, setProgram] = useState('private');
  const [lessonFormat, setLessonFormat] = useState('full_day');
  const [skillLevel, setSkillLevel] = useState('never_skied');
  const [startTime, setStartTime] = useState('09:00');
  const [requestedInstructorId, setRequestedInstructorId] = useState('');
  const [instructorSearch, setInstructorSearch] = useState('');
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formats = program === 'private' ? PRIVATE_FORMATS : GROUP_FORMATS;
  const showSkillLevel = program === 'group';
  const showStartTime = lessonFormat === 'one_hour' || lessonFormat === 'one_hour_kids';

  const filteredInstructors = instructors.filter((i) =>
    i.name.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const selectedInstructor = instructors.find((i) => i.id.toString() === requestedInstructorId);

  const handleProgramChange = (p: string) => {
    setProgram(p);
    // Reset format to first valid option
    const newFormats = p === 'private' ? PRIVATE_FORMATS : GROUP_FORMATS;
    setLessonFormat(newFormats[0].value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addLesson({
        date,
        discipline,
        program,
        format: lessonFormat,
        skillLevel: showSkillLevel ? skillLevel : null,
        startTime: showStartTime ? startTime : null,
        requestedInstructorId: requestedInstructorId ? parseInt(requestedInstructorId) : null,
        weekStartDate: format(weekStart, 'yyyy-MM-dd'),
      });
      onSaved();
    } catch (err) {
      setError('Failed to add lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-navy-800 border border-navy-600 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600 sticky top-0 bg-navy-800 z-10">
          <h2 className="text-base font-semibold text-white">Add Lesson</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-ice-500/50 transition-colors"
            >
              {weekDays.map((d) => (
                <option key={d.toISOString()} value={format(d, 'yyyy-MM-dd')}>
                  {format(d, 'EEEE, MMM d')}
                </option>
              ))}
            </select>
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Discipline *
            </label>
            <div className="flex gap-2">
              {['ski', 'snowboard'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscipline(d)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    discipline === d
                      ? 'bg-ice-500/15 border-ice-500/40 text-ice-400'
                      : 'bg-navy-700 border-navy-600 text-slate-400 hover:text-white hover:border-navy-500'
                  }`}
                >
                  {d === 'ski' ? 'Ski' : 'Snowboard'}
                </button>
              ))}
            </div>
          </div>

          {/* Program */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Program *
            </label>
            <div className="flex gap-2">
              {['private', 'group'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProgramChange(p)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    program === p
                      ? 'bg-ice-500/15 border-ice-500/40 text-ice-400'
                      : 'bg-navy-700 border-navy-600 text-slate-400 hover:text-white hover:border-navy-500'
                  }`}
                >
                  {p === 'private' ? 'Private' : 'Group'}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Format *
            </label>
            <select
              value={lessonFormat}
              onChange={(e) => setLessonFormat(e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-ice-500/50 transition-colors"
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Level (group only) */}
          {showSkillLevel && (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Skill Level *
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-ice-500/50 transition-colors"
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Time (1-hour privates only) */}
          {showStartTime && (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-ice-500/50 transition-colors"
              >
                {ONE_HOUR_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Requested Instructor */}
          <div className="relative">
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Requested Instructor
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedInstructor ? selectedInstructor.name : instructorSearch}
                onChange={(e) => {
                  setInstructorSearch(e.target.value);
                  setRequestedInstructorId('');
                  setShowInstructorDropdown(true);
                }}
                onFocus={() => setShowInstructorDropdown(true)}
                onBlur={() => setTimeout(() => setShowInstructorDropdown(false), 150)}
                placeholder="Search instructors..."
                className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-ice-500/50 transition-colors"
              />
              {requestedInstructorId && (
                <button
                  type="button"
                  onClick={() => {
                    setRequestedInstructorId('');
                    setInstructorSearch('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showInstructorDropdown && !requestedInstructorId && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-navy-700 border border-navy-600 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setRequestedInstructorId('');
                    setInstructorSearch('');
                    setShowInstructorDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left text-slate-500 hover:bg-navy-600 hover:text-white transition-colors"
                >
                  No preference
                </button>
                {filteredInstructors.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => {
                      setRequestedInstructorId(inst.id.toString());
                      setInstructorSearch('');
                      setShowInstructorDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left text-slate-200 hover:bg-navy-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{inst.name}</span>
                    <span className="text-xs text-slate-500 font-mono">L{inst.certificationLevel}</span>
                  </button>
                ))}
                {filteredInstructors.length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-500">No instructors found</div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold bg-ice-500 hover:bg-ice-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? 'Adding...' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
