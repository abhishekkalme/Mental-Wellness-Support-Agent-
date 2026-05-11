'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Heart, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/insights', icon: BarChart3, label: 'Insights' },
  { href: '/mood', icon: Heart, label: 'Mood' },
  { href: '/agent-chat', icon: MessageSquare, label: 'AI' },
  { href: '/admin', icon: User, label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[#0A0C0B]/90 backdrop-blur-xl border-t border-white/5 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                  isActive ? 'text-[#E2FF6F]' : 'text-white/40'
                )}
              >
                <item.icon
                  className={cn('w-5 h-5 transition-transform', isActive ? 'scale-110' : '')}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
