'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  ArrowUp,
  ArrowDown,
  CreditCard,
} from 'lucide-react';
import { getCurrencySymbol } from '@/lib/currency';

export default function EarningsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, sessionsRes] = await Promise.all([
          fetch('/api/therapists/analytics'),
          fetch('/api/therapists/sessions?role=therapist&limit=100'),
        ]);
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions((data.sessions || []).filter((s: any) => s.amount > 0));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const earnings = analytics?.totalEarnings || 0;
  const paidSessions = sessions.filter(
    (s) => s.paymentStatus === 'paid' || s.status === 'completed'
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <DollarSign className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Earnings</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Your income & payouts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">Revenue (30d)</p>
          <p className="text-3xl font-black text-white mt-1">
            {getCurrencySymbol(analytics?.currency)}
            {earnings}
          </p>
          <p className="text-xs text-white/30 mt-1">{paidSessions.length} paid sessions</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">
            Avg. Per Session
          </p>
          <p className="text-3xl font-black text-white mt-1">
            {getCurrencySymbol(analytics?.currency)}
            {paidSessions.length > 0 ? Math.round(earnings / paidSessions.length) : 0}
          </p>
          <p className="text-xs text-white/30 mt-1">Last 30 days</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">Pending</p>
          <p className="text-3xl font-black text-amber-400 mt-1">
            {getCurrencySymbol(analytics?.currency)}0
          </p>
          <p className="text-xs text-white/30 mt-1">Awaiting payout</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">Paid Out</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">
            {getCurrencySymbol(analytics?.currency)}0
          </p>
          <p className="text-xs text-white/30 mt-1">All time</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
          Recent Sessions
        </h3>
        {paidSessions.length === 0 ? (
          <p className="text-white/20 text-sm py-4 text-center">No paid sessions yet</p>
        ) : (
          <div className="space-y-2">
            {paidSessions.slice(0, 20).map((s: any) => (
              <div
                key={s._id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-emerald-400">
                    {s.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{s.userId?.name || 'Client'}</p>
                    <p className="text-xs text-white/40">
                      {s.date} at {s.time} · {s.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    {getCurrencySymbol(analytics?.currency)}
                    {s.amount || 0}
                  </p>
                  <p className="text-[10px] text-white/30 capitalize">
                    {s.paymentStatus || s.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
