'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { getCurrencySymbol } from '@/lib/currency';
import toast from 'react-hot-toast';

interface Analytics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  totalEarnings: number;
  currency: string;
  averageRating: number;
  clientRetentionRate: number;
  utilizationRate: number;
  periodSessions: { date: string; count: number }[];
  totalClients: number;
  returningClients: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {sub && <p className="text-xs text-white/30">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function useAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/therapists/analytics')
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

function useUpcomingSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/therapists/sessions?role=therapist&status=confirmed&limit=5')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSessions(d?.sessions || []))
      .catch(() => toast.error('Failed to load upcoming sessions'))
      .finally(() => setLoading(false));
  }, []);
  return { sessions, loading };
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className || ''}`} />;
}

export default function TherapistDashboard() {
  const { data: analytics, loading: analyticsLoading } = useAnalytics();
  const { sessions: upcomingSessions, loading: sessionsLoading } = useUpcomingSessions();

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Activity className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Therapist Dashboard</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Your Practice at a Glance
          </p>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={CalendarCheck}
              label="Total Sessions"
              value={analytics.totalSessions}
              sub={`${analytics.completedSessions} completed`}
              color="bg-purple-500/10 text-purple-400"
            />
            <StatCard
              icon={Star}
              label="Avg Rating"
              value={analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : 'New'}
              sub="from real reviews"
              color="bg-amber-500/10 text-amber-400"
            />
            <StatCard
              icon={Users}
              label="Clients"
              value={analytics.totalClients}
              sub={`${analytics.returningClients} returning`}
              color="bg-sky-500/10 text-sky-400"
            />
            <StatCard
              icon={DollarSign}
              label="Earnings (30d)"
              value={`${getCurrencySymbol(analytics.currency)}${analytics.totalEarnings}`}
              sub={`${analytics.completedSessions} sessions`}
              color="bg-emerald-500/10 text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
                  Quick Stats
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: 'Session Completion',
                    value:
                      analytics.totalSessions > 0
                        ? `${Math.round((analytics.completedSessions / analytics.totalSessions) * 100)}%`
                        : '0%',
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Client Retention',
                    value: `${analytics.clientRetentionRate}%`,
                    color: 'text-sky-400',
                  },
                  {
                    label: 'Cancellation Rate',
                    value:
                      analytics.totalSessions > 0
                        ? `${Math.round((analytics.cancelledSessions / analytics.totalSessions) * 100)}%`
                        : '0%',
                    color: analytics.cancelledSessions > 5 ? 'text-rose-400' : 'text-emerald-400',
                  },
                  {
                    label: 'Utilization',
                    value: `${analytics.utilizationRate}%`,
                    color: analytics.utilizationRate > 50 ? 'text-emerald-400' : 'text-amber-400',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-2">
                    <span className="text-xs text-white/60">{stat.label}</span>
                    <span className={`text-sm font-bold font-mono ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
                  Upcoming Sessions
                </h3>
                <Link
                  href="/therapist-admin/sessions"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <p className="text-white/20 text-sm py-4 text-center">No upcoming sessions</p>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.map((s: any) => (
                    <Link
                      key={s._id}
                      href={`/therapist-admin/sessions/${s._id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-purple-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-400">
                          {s.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                            {s.userId?.name || 'Client'}
                          </p>
                          <p className="text-[10px] text-white/40">
                            {s.date} at {s.time}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 capitalize">
                        {s.type}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {analytics.periodSessions.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
                Session Activity (30 days)
              </h3>
              <div className="flex items-end gap-1 h-32">
                {analytics.periodSessions.map((day, i) => {
                  const maxCount = Math.max(...analytics.periodSessions.map((d) => d.count), 1);
                  const height = (day.count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-full mb-1 text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded whitespace-nowrap">
                        {day.date}: {day.count} session{day.count !== 1 ? 's' : ''}
                      </div>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-purple-500/40 to-purple-400/20 hover:from-purple-500/60 transition-all cursor-pointer"
                        style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                      />
                      <span className="text-[8px] text-white/20">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-10 text-center backdrop-blur-md">
          <p className="text-white/30 font-bold">Complete your profile setup to see analytics</p>
          <Link href="/therapist-admin/profile">
            <button className="mt-4 px-6 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-sm hover:bg-purple-500/20 transition-all">
              Set Up Profile
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
