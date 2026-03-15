import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { formatLabel, skillLevelLabel } from '@/lib/certUtils';
import { format } from 'date-fns';

interface ConflictItem {
  lessonId: number;
  status: string;
  warningMsg?: string | null;
  lesson: {
    date: Date | string;
    discipline: string;
    program: string;
    format: string;
    skillLevel?: string | null;
  };
  instructor?: {
    name: string;
  } | null;
}

interface ConflictPanelProps {
  items: ConflictItem[];
}

export default function ConflictPanel({ items }: ConflictPanelProps) {
  const conflicts = items.filter((i) => i.status === 'conflict');
  const warnings = items.filter((i) => i.status === 'warning');
  const unresolved = items.filter((i) => i.status === 'unresolved');

  if (conflicts.length === 0 && warnings.length === 0 && unresolved.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
        <Info className="w-4 h-4 shrink-0" />
        All lessons assigned successfully — no conflicts or warnings.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unresolved.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-red-500/20">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400 font-mono uppercase tracking-wider">
              Unresolved ({unresolved.length})
            </span>
          </div>
          <div className="divide-y divide-red-500/10">
            {unresolved.map((item) => (
              <div key={item.lessonId} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                <div className="flex-1">
                  <span className="text-white font-medium">
                    {format(new Date(item.lesson.date), 'EEE MMM d')}
                  </span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-300 font-mono text-xs">
                    {item.lesson.discipline.toUpperCase()} / {item.lesson.program.toUpperCase()} / {formatLabel(item.lesson.format)}
                    {item.lesson.skillLevel && ` / ${skillLevelLabel(item.lesson.skillLevel)}`}
                  </span>
                </div>
                <span className="text-red-400 text-xs">{item.warningMsg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-red-500/20">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400 font-mono uppercase tracking-wider">
              Conflicts ({conflicts.length})
            </span>
          </div>
          <div className="divide-y divide-red-500/10">
            {conflicts.map((item) => (
              <div key={item.lessonId} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                <div className="flex-1">
                  <span className="text-white font-medium">
                    {format(new Date(item.lesson.date), 'EEE MMM d')}
                  </span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-300 font-mono text-xs">
                    {formatLabel(item.lesson.format)}
                  </span>
                  {item.instructor && (
                    <>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="text-ice-400 text-xs">{item.instructor.name}</span>
                    </>
                  )}
                </div>
                {item.warningMsg && (
                  <span className="text-red-400 text-xs">{item.warningMsg}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400 font-mono uppercase tracking-wider">
              Warnings ({warnings.length})
            </span>
          </div>
          <div className="divide-y divide-amber-500/10">
            {warnings.map((item) => (
              <div key={item.lessonId} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                <div className="flex-1">
                  <span className="text-white font-medium">
                    {format(new Date(item.lesson.date), 'EEE MMM d')}
                  </span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-300 font-mono text-xs">
                    {formatLabel(item.lesson.format)}
                  </span>
                  {item.instructor && (
                    <>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="text-ice-400 text-xs">{item.instructor.name}</span>
                    </>
                  )}
                </div>
                {item.warningMsg && (
                  <span className="text-amber-400 text-xs">{item.warningMsg}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
