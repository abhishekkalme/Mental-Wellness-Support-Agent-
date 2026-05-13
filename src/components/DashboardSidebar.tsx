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
  MessageSquare,
  Target,
  Users,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CalendarDays,
  Wind,
  ListChecks,
  Library,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { allNavItems, filterNavByRole, getNavBySection, type NavItem } from '@/config/navigation';

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

  const navItems = useMemo(() => filterNavByRole(allNavItems, role), [role]);
  const sections = useMemo(() => getNavBySection(navItems), [navItems]);

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
        <NavSection items={sections.primary} pathname={pathname} isExpanded={isExpanded} />

        {sections.wellness.length > 0 && (
          <>
            <div className="h-px bg-white/5 mx-3" />
            <NavSection
              items={sections.wellness}
              title="Wellness"
              pathname={pathname}
              isExpanded={isExpanded}
            />
          </>
        )}

        {sections.progress.length > 0 && (
          <>
            <div className="h-px bg-white/5 mx-3" />
            <NavSection
              items={sections.progress}
              title="Progress"
              pathname={pathname}
              isExpanded={isExpanded}
            />
          </>
        )}

        {sections.ai.length > 0 && (
          <>
            <div className="h-px bg-white/5 mx-3" />
            <NavSection
              items={sections.ai}
              title="AI"
              pathname={pathname}
              isExpanded={isExpanded}
            />
          </>
        )}

        {sections.social.length > 0 && (
          <>
            <div className="h-px bg-white/5 mx-3" />
            <NavSection
              items={sections.social}
              title="Social"
              pathname={pathname}
              isExpanded={isExpanded}
            />
          </>
        )}

        {sections.tools.length > 0 && (
          <>
            <div className="h-px bg-white/5 mx-3" />
            <NavSection
              items={sections.tools}
              title="Tools"
              pathname={pathname}
              isExpanded={isExpanded}
            />
          </>
        )}

        {sections.more.length > 0 && (
          <>
            <div className="h-px bg-white/5 mx-3" />
            <NavSection
              items={sections.more}
              title="More"
              pathname={pathname}
              isExpanded={isExpanded}
            />
          </>
        )}
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
          <div className="group relative">
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
                    {role === 'mentor' && (
                      <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Soon
                      </span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            {role === 'mentor' && (
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-xs text-white/60 shadow-xl z-50">
                Mentor dashboard is under development.
              </div>
            )}
          </div>
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
                      onClick={() => {
                        useStore.getState().clearStore();
                        useStore.getState().clearPersistedData();
                        signOut({ callbackUrl: '/' });
                      }}
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
                  onClick={() => {
                    useStore.getState().clearStore();
                    useStore.getState().clearPersistedData();
                    signOut({ callbackUrl: '/' });
                  }}
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
