'use client';

import { motion } from 'framer-motion';
import { Calendar, Inbox, MessageSquare, Star, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const sections = [
  {
    title: 'Session requests',
    desc: 'Incoming bookings and context packages will appear here.',
    icon: Inbox,
  },
  {
    title: 'Upcoming sessions',
    desc: 'Calendar, join links, and pre-session notes.',
    icon: Calendar,
  },
  {
    title: 'Messages',
    desc: 'Secure chat with booked clients (pre/post session).',
    icon: MessageSquare,
  },
  {
    title: 'Earnings & payouts',
    desc: 'Completed sessions, revenue, and payout history.',
    icon: Wallet,
  },
  {
    title: 'Ratings & reviews',
    desc: 'Client feedback aggregated on your public profile.',
    icon: Star,
  },
];

export default function MentorDashboardPage() {
  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E2FF6F]/80">
          Mentor / therapist
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your practice hub</h1>
        <p className="text-white/50 max-w-2xl text-lg">
          Verified mentors manage bookings, sessions, and client context from here. Full booking
          flows and payouts connect to the premium directory at{' '}
          <Link href="/therapists" className="text-[#E2FF6F] underline-offset-4 hover:underline">
            /therapists
          </Link>{' '}
          as the product grows.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 flex gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center shrink-0">
              <s.icon className="w-6 h-6 text-[#E2FF6F]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-lg">{s.title}</h2>
              <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Back to home dashboard
          </Button>
        </Link>
        <Link href="/therapists">
          <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056]">
            Browse directory (user view)
          </Button>
        </Link>
      </div>
    </div>
  );
}
