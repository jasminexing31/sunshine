'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mountain, Users, BookOpen, CalendarDays, Clock } from 'lucide-react';

const navLinks = [
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/roster', label: 'Roster', icon: Users },
  { href: '/history', label: 'History', icon: Clock },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-navy-800 border-b border-ice-500/10 backdrop-blur-sm">
      <div className="max-w-screen-2xl mx-auto h-full px-6 flex items-center gap-8">
        {/* Logo */}
        <Link href="/schedule" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-ice-500/20 border border-ice-500/30 flex items-center justify-center">
            <Mountain className="w-4 h-4 text-ice-400" />
          </div>
          <div className="leading-tight">
            <div className="text-xs text-ice-400 font-mono tracking-widest uppercase">Sunshine Village</div>
            <div className="text-sm font-semibold text-white leading-none">Snow School</div>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-8 bg-navy-600" />

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/schedule' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-ice-500/15 text-ice-400 border border-ice-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-navy-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </div>
      </div>
    </nav>
  );
}
