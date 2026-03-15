interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  assigned: {
    label: 'Assigned',
    className: 'bg-ice-500/15 text-ice-400 border border-ice-500/30',
  },
  warning: {
    label: 'Warning',
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  },
  conflict: {
    label: 'Conflict',
    className: 'bg-red-500/15 text-red-400 border border-red-500/30',
  },
  unresolved: {
    label: 'Unresolved',
    className: 'bg-red-500/20 text-red-300 border border-red-500/40',
  },
  'not-needed': {
    label: 'Not Needed',
    className: 'bg-slate-500/10 text-slate-500 border border-slate-700',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  },
  off: {
    label: 'Day Off',
    className: 'bg-navy-700 text-slate-600 border border-navy-600',
  },
  draft: {
    label: 'Draft',
    className: 'bg-slate-500/10 text-slate-400 border border-slate-700',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-slate-700 text-slate-300 border border-slate-600',
  };

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <span className={`inline-flex items-center rounded font-mono font-medium uppercase tracking-wider ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}
