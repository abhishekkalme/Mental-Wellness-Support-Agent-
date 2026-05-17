'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  UserCircle,
  CalendarDays,
  CalendarCheck,
  Users,
  MessageSquare,
  BarChart3,
  DollarSign,
  Stethoscope,
  ChevronLeft,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/therapist-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/therapist-admin/profile', label: 'Profile', icon: UserCircle },
  { href: '/therapist-admin/availability', label: 'Availability', icon: CalendarDays },
  { href: '/therapist-admin/sessions', label: 'Sessions', icon: CalendarCheck },
  { href: '/therapist-admin/clients', label: 'Clients', icon: Users },
  { href: '/therapist-admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/therapist-admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/therapist-admin/earnings', label: 'Earnings', icon: DollarSign },
];

export default function TherapistAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0A0D08] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-purple-500/3 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="w-64 border-r border-white/5 p-4 hidden lg:block bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Stethoscope className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Therapist Admin</h2>
              <Link
                href="/dashboard"
                className="text-[10px] text-white/30 hover:text-white/50 flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Back to app
              </Link>
            </div>
          </div>

          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="lg:hidden flex items-center gap-3 mb-6 overflow-x-auto pb-2">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
