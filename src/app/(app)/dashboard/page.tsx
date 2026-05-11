'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Bell, User, ShieldAlert } from 'lucide-react';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { WellbeingSummary } from '@/components/dashboard/WellbeingSummary';
import { AIInsight } from '@/components/dashboard/AIInsight';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0C0B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E2FF6F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0B]">
      <header className="sticky top-0 z-40 bg-[#0A0C0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-white">
                {getGreeting()}
                {store.name ? `, ${store.name}` : ''} 👋
              </h1>
              <p className="text-xs text-white/40">{dateStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/crisis">
              <Button
                variant="outline"
                size="sm"
                className="bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 gap-2 rounded-full h-10 px-4"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">SOS</span>
              </Button>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                <Bell className="w-5 h-5" />
              </button>
              {showNotifications && (
                <div className="absolute top-12 right-0 w-72 bg-[#141716] border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                  <h3 className="font-bold text-white mb-2 text-sm">Notifications</h3>
                  <div className="text-white/40 text-xs py-4 text-center">No new notifications</div>
                </div>
              )}
            </div>

            <Link href="/admin">
              <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden border border-white/10 hover:border-[#E2FF6F]/30 transition-all">
                <div className="w-full h-full bg-[#E2FF6F]/10 flex items-center justify-center text-[#E2FF6F]">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-24 md:pb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <QuickActions />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5">
              <TodaysFocus />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5">
              <WellbeingSummary />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AIInsight />
        </motion.div>
      </main>
    </div>
  );
}
