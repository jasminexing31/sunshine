'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';

interface WeekPickerProps {
  weekStart: Date;
  onChange: (date: Date) => void;
}

export default function WeekPicker({ weekStart, onChange }: WeekPickerProps) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(subWeeks(weekStart, 1))}
        className="w-8 h-8 rounded-lg bg-navy-700 border border-navy-600 hover:border-ice-500/40 hover:text-ice-400 flex items-center justify-center transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="px-4 py-1.5 bg-navy-700 border border-navy-600 rounded-lg min-w-[220px] text-center">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-0.5">
          Week of
        </div>
        <div className="text-sm font-semibold text-white font-mono">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
        </div>
      </div>

      <button
        onClick={() => onChange(addWeeks(weekStart, 1))}
        className="w-8 h-8 rounded-lg bg-navy-700 border border-navy-600 hover:border-ice-500/40 hover:text-ice-400 flex items-center justify-center transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <button
        onClick={() => onChange(startOfWeek(new Date(), { weekStartsOn: 1 }))}
        className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-ice-400 hover:bg-navy-700 rounded-lg border border-navy-600 hover:border-ice-500/30 transition-all"
      >
        THIS WEEK
      </button>
    </div>
  );
}
