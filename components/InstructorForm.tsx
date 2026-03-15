'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { addInstructor, updateInstructor } from '@/app/actions/instructors';

interface Instructor {
  id: number;
  name: string;
  certificationLevel: number;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
}

interface InstructorFormProps {
  instructor?: Instructor;
  onClose: () => void;
  onSaved: () => void;
}

export default function InstructorForm({ instructor, onClose, onSaved }: InstructorFormProps) {
  const [name, setName] = useState(instructor?.name ?? '');
  const [certLevel, setCertLevel] = useState(instructor?.certificationLevel?.toString() ?? '1');
  const [email, setEmail] = useState(instructor?.email ?? '');
  const [phone, setPhone] = useState(instructor?.phone ?? '');
  const [isActive, setIsActive] = useState(instructor?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        name,
        certificationLevel: parseInt(certLevel),
        email: email || null,
        phone: phone || null,
        isActive,
      };

      if (instructor) {
        await updateInstructor(instructor.id, data);
      } else {
        await addInstructor(data);
      }
      onSaved();
    } catch (err) {
      setError('Failed to save instructor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-navy-800 border border-navy-600 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600">
          <h2 className="text-base font-semibold text-white">
            {instructor ? 'Edit Instructor' : 'Add Instructor'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Full name"
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-ice-500/50 focus:ring-1 focus:ring-ice-500/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Certification Level *
            </label>
            <select
              value={certLevel}
              onChange={(e) => setCertLevel(e.target.value)}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-ice-500/50 focus:ring-1 focus:ring-ice-500/20 transition-colors"
            >
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@sunshine.ca"
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-ice-500/50 focus:ring-1 focus:ring-ice-500/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="403-555-0000"
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-ice-500/50 focus:ring-1 focus:ring-ice-500/20 transition-colors"
            />
          </div>

          {instructor && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-ice-500' : 'bg-navy-600'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
              <span className="text-sm text-slate-300">
                {isActive ? 'Active' : 'Deactivated'}
              </span>
            </div>
          )}

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
              disabled={loading || !name}
              className="px-4 py-2 text-sm font-semibold bg-ice-500 hover:bg-ice-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : instructor ? 'Save Changes' : 'Add Instructor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
