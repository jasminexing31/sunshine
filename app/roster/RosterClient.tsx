'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, UserX, Users, Shield, Mail, Phone } from 'lucide-react';
import InstructorForm from '@/components/InstructorForm';
import { certLevelLabel } from '@/lib/certUtils';

interface Instructor {
  id: number;
  name: string;
  certificationLevel: number;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  _count: {
    assignments: number;
    daysOff: number;
  };
}

interface RosterClientProps {
  instructors: Instructor[];
}

const certColors: Record<number, string> = {
  1: 'text-slate-400 border-slate-600',
  2: 'text-emerald-400 border-emerald-500/30',
  3: 'text-ice-400 border-ice-500/30',
  4: 'text-amber-400 border-amber-500/30',
};

export default function RosterClient({ instructors }: RosterClientProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = instructors.filter((i) => {
    if (filter === 'active') return i.isActive;
    if (filter === 'inactive') return !i.isActive;
    return true;
  });

  const activeCount = instructors.filter((i) => i.isActive).length;
  const inactiveCount = instructors.filter((i) => !i.isActive).length;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Instructor Roster</h1>
          <p className="text-slate-400 text-sm mt-1">
            {activeCount} active · {inactiveCount} inactive
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ice-500 hover:bg-ice-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Instructor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((level) => {
          const count = instructors.filter((i) => i.certificationLevel === level && i.isActive).length;
          return (
            <div
              key={level}
              className="bg-navy-800 border border-navy-600 rounded-xl p-4 relative overflow-hidden noise-bg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-4 h-4 ${certColors[level].split(' ')[0]}`} />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {certLevelLabel(level)}
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-white">{count}</div>
              <div className="text-xs text-slate-500 mt-0.5">active instructors</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg border transition-all ${
              filter === f
                ? 'bg-ice-500/15 border-ice-500/30 text-ice-400'
                : 'bg-navy-700 border-navy-600 text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-600">
              <th className="px-5 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Level</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Assignments</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-mono text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">
                  No instructors found.
                </td>
              </tr>
            ) : (
              filtered.map((instructor, idx) => (
                <tr
                  key={instructor.id}
                  className={`border-b border-navy-700/50 transition-colors hover:bg-navy-700/30 ${
                    !instructor.isActive ? 'opacity-50' : ''
                  } ${idx % 2 === 0 ? '' : 'bg-navy-700/10'}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${certColors[instructor.certificationLevel] ?? 'text-white border-navy-600'}`}
                      >
                        {instructor.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{instructor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded border ${certColors[instructor.certificationLevel] ?? 'text-white border-navy-600'}`}
                    >
                      <Shield className="w-2.5 h-2.5" />
                      L{instructor.certificationLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {instructor.email ? (
                      <a
                        href={`mailto:${instructor.email}`}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-ice-400 transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        {instructor.email}
                      </a>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {instructor.phone ? (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Phone className="w-3 h-3" />
                        {instructor.phone}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-slate-400">
                      {instructor._count.assignments}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {instructor.isActive ? (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-700/50 text-slate-500 border border-slate-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setEditingInstructor(instructor)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-navy-700 rounded-md transition-colors border border-transparent hover:border-navy-500"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddForm && (
        <InstructorForm
          onClose={() => setShowAddForm(false)}
          onSaved={() => {
            setShowAddForm(false);
            router.refresh();
          }}
        />
      )}
      {editingInstructor && (
        <InstructorForm
          instructor={editingInstructor}
          onClose={() => setEditingInstructor(null)}
          onSaved={() => {
            setEditingInstructor(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
