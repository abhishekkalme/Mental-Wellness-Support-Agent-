'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Heart,
  BookText,
  Moon,
  MessageSquare,
  Target,
  Users,
  ShieldAlert,
  Settings,
  Wind,
  MoreHorizontal,
  X,
  Stethoscope,
  CalendarDays,
  ListChecks,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { allNavItems, filterNavByRole, mobilePrimaryItems } from '@/config/navigation';
import type { NavItem } from '@/config/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? 'user';
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = filterNavByRole(allNavItems, role);
  const primaryItems = navItems.filter((item) => mobilePrimaryItems.includes(item.href));
  const secondaryItems = navItems.filter((item) => !mobilePrimaryItems.includes(item.href));

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const primaryLabels: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/mood': 'Check-in',
    '/chat': 'AI',
    '/crisis': 'SOS',
  };

  return (
    <>
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-[#0A0C0B]/90 backdrop-blur-xl border-t border-white/5 px-2 py-2">
          <div className="flex items-center justify-around">
            {primaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                  isActive(item.href) ? 'text-[#E2FF6F]' : 'text-white/50 hover:text-white'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive(item.href) ? 'scale-110' : '')} />
                <span className="text-[10px] font-medium">
                  {primaryLabels[item.href] || item.name}
                </span>
              </Link>
            ))}
            <button
              onClick={() => setIsMoreOpen(true)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                'text-white/50 hover:text-white'
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-full left-0 right-0 bg-[#0A0C0B]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">More</h3>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {secondaryItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all',
                      isActive(item.href)
                        ? 'bg-white/10 text-[#E2FF6F]'
                        : 'text-white/50 hover:bg-white/5 hover:text-white',
                      item.className
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
