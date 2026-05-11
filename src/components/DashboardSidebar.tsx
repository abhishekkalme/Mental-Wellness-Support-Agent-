'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart3,
  Heart,
  BookText,
  Moon,
  Brain,
  MessageSquare,
  Target,
  Users,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: ('admin' | 'mentor')[];
  badge?: string;
};

const primaryNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
];

const wellnessNavItems: NavItem[] = [
  { name: 'Mood', href: '/mood', icon: Heart },
  { name: 'Journal', href: '/journal', icon: BookText },
  { name: 'Meditate', href: '/meditation', icon: Brain },
  { name: 'Sleep', href: '/sleep', icon: Moon },
];

const progressNavItems: NavItem[] = [{ name: 'Habits', href: '/habits', icon: Target }];

const aiNavItems: NavItem[] = [{ name: 'AI Companion', href: '/agent-chat', icon: MessageSquare }];

const socialNavItems: NavItem[] = [{ name: 'Community', href: '/community', icon: Users }];

interface NavSectionProps {
  items: NavItem[];
  title?: string;
  pathname: string;
  isExpanded: boolean;
}

function NavSection({ items, title, pathname, isExpanded }: NavSectionProps) {
  return (
    <div className="space-y-1">
      {title && isExpanded && (
        <div
          className={cn(
            'px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/20',
            'transition-opacity duration-200'
          )}
        >
          {title}
        </div>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
              isActive
                ? 'bg-[#E2FF6F]/10 text-[#E2FF6F]'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#E2FF6F] rounded-r-full"
              />
            )}
            <item.icon
              className={cn('w-5 h-5 shrink-0', isActive ? 'text-[#E2FF6F]' : 'text-white/40')}
            />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </div>
  );
}

interface DashboardSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isExpanded, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? 'user';

  const filteredSocialItems = useMemo(
    () =>
      socialNavItems.filter((item) => {
        if (!item.roles?.length) return true;
        return item.roles.includes(role as 'admin' | 'mentor');
      }),
    [role]
  );

  const filteredProgressItems = useMemo(
    () =>
      progressNavItems.filter((item) => {
        if (!item.roles?.length) return true;
        return item.roles.includes(role as 'admin' | 'mentor');
      }),
    [role]
  );

  const filteredAiItems = useMemo(
    () =>
      aiNavItems.filter((item) => {
        if (!item.roles?.length) return true;
        return item.roles.includes(role as 'admin' | 'mentor');
      }),
    [role]
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 72 }}
      className={cn(
        'fixed left-0 top-0 h-screen z-50',
        'bg-[#0A0C0B]/80 backdrop-blur-xl border-r border-white/5',
        'flex flex-col transition-all duration-300'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-[#E2FF6F] rounded-xl flex items-center justify-center shrink-0">
            <span className="font-bold text-black text-sm">MC</span>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-white text-lg whitespace-nowrap"
              >
                MindCare
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4 no-scrollbar">
        <NavSection items={primaryNavItems} pathname={pathname} isExpanded={isExpanded} />

        <div className="h-px bg-white/5 mx-3" />

        <NavSection
          items={wellnessNavItems}
          title="Wellness"
          pathname={pathname}
          isExpanded={isExpanded}
        />

        <NavSection
          items={filteredProgressItems}
          title="Progress"
          pathname={pathname}
          isExpanded={isExpanded}
        />

        <NavSection
          items={filteredAiItems}
          title="AI"
          pathname={pathname}
          isExpanded={isExpanded}
        />

        <NavSection
          items={filteredSocialItems}
          title="Social"
          pathname={pathname}
          isExpanded={isExpanded}
        />
      </nav>

      <div className="p-2 space-y-2 border-t border-white/5">
        <Link
          href="/crisis"
          className={cn(
            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
            'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
          )}
        >
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Crisis Support
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {(role === 'admin' || role === 'mentor') && (
          <Link
            href={role === 'admin' ? '/admin' : '/mentor'}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              'text-white/40 hover:text-white hover:bg-white/5'
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {role === 'admin' ? 'Admin' : 'Mentor'}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        )}

        {session?.user && (
          <div className="pt-2 border-t border-white/5">
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-[#E2FF6F]/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[#E2FF6F]" />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-white truncate text-xs font-medium">
                      {session.user.name || session.user.email || 'User'}
                    </p>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-white/40 hover:text-rose-400 text-xs flex items-center gap-1 mt-0.5"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isExpanded && (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-rose-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 w-6 h-6 rounded-full',
          'bg-[#E2FF6F] text-black flex items-center justify-center',
          'hover:scale-110 transition-transform shadow-lg',
          'hidden md:flex'
        )}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
