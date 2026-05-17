'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, User, Settings, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '@/store/useStore';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

export function DashboardHeader() {
  const name = useStore((s) => s.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const today = format(new Date(), 'EEEE, MMM d');

  return (
    <header className="flex items-center justify-between">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">
          {greeting()}
          {name ? `, ${name}` : ''}
        </h1>
        <p className="text-sm text-white/40 mt-0.5">{today}</p>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Link
          href="/crisis"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SOS</span>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all"
            aria-label="User menu"
          >
            <User className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-11 w-48 bg-[#141716] border border-white/10 rounded-2xl p-2 shadow-2xl z-50"
                >
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      useStore.getState().clearStore();
                      useStore.getState().clearPersistedData();
                      toast.success('Signed out');
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
