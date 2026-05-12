'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { allNavItems, filterNavByRole, mobilePrimaryItems } from '@/config/navigation';
import type { NavItem } from '@/config/navigation';

export function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? 'user';

  const filteredNavItems = filterNavByRole(allNavItems, role);

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'w-72 border-r border-white/5 bg-black h-screen flex flex-col fixed left-0 top-0 z-40 transition-transform duration-200 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-96 bg-[#E2FF6F]/5 blur-[120px] -z-10" />
        <Link href="/" className="flex items-center gap-2 pointer-events-auto group">
          <div className="h-20 flex items-center px-8 gap-3">
            <div className="w-9 h-9 bg-[#E2FF6F] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h2 className="font-bold tracking-tighter text-2xl text-white">MindCare</h2>
          </div>
        </Link>

        <div className="flex-1 overflow-y-auto pt-6 pb-8 px-6 space-y-2 no-scrollbar">
          {filteredNavItems.map((item: NavItem) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden',
                  isActive
                    ? 'bg-white/10 text-[#E2FF6F] shadow-xl shadow-black/20'
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#E2FF6F] rounded-full"
                  />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-all group-active:scale-90',
                    isActive ? 'text-[#E2FF6F] scale-110' : 'text-white/20 group-hover:text-white'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Growing together widget */}
        <div className="p-6 space-y-4">
          <Link href="/crisis" className="block">
            <button className="w-full h-16 rounded-[24px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-sm flex items-center justify-center gap-3 border border-rose-500/20 transition-all active:scale-95 group">
              <Library className="w-5 h-5 group-hover:animate-pulse" /> Emergency Support
            </button>
          </Link>

          {/* <div className="glass-panel p-8 flex flex-col items-center gap-4 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E2FF6F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-20 h-20 grayscale brightness-125 group-hover:grayscale-0 transition-all duration-500">
                <Image 
                    src="/assets/images/meditating-character.png" 
                    alt="Plant" 
                    fill 
                    className="object-contain"
                />
            </div>
            <div className="space-y-1 relative z-10">
                <h4 className="font-bold text-white text-lg tracking-tight">Growing together</h4>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">Daily Resilience 🌿</p>
            </div>
        </div> */}
        </div>
      </aside>
    </>
  );
}
