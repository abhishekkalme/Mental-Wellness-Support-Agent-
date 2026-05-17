'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  CalendarCheck,
  DollarSign,
  Star,
  Users,
  Activity,
  ArrowUp,
  ArrowDown,
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
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down';
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
      {trend && (
        <div
          className={`flex items-center gap-1 mt-3 text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {trend === 'up' ? 'Improving' : 'Needs attention'}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/therapists/analytics')
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30 font-bold">Complete sessions to see analytics</p>
      </div>
    );
  }

  const completionRate =
    data.totalSessions > 0 ? Math.round((data.completedSessions / data.totalSessions) * 100) : 0;
  const cancelRate =
    data.totalSessions > 0 ? Math.round((data.cancelledSessions / data.totalSessions) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <BarChart3 className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Performance insights & trends
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarCheck}
          label="Total Sessions"
          value={data.totalSessions}
          sub={`${data.completedSessions} completed`}
          trend={completionRate > 70 ? 'up' : 'down'}
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={data.averageRating > 0 ? data.averageRating.toFixed(1) : 'N/A'}
          sub="from real reviews"
          trend={data.averageRating >= 4 ? 'up' : 'down'}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={data.totalClients}
          sub={`${data.returningClients} returning (${data.clientRetentionRate}%)`}
          trend={data.clientRetentionRate > 50 ? 'up' : 'down'}
          color="bg-sky-500/10 text-sky-400"
        />
        <StatCard
          icon={DollarSign}
          label="Earnings (30d)"
          value={`${getCurrencySymbol(data.currency)}${data.totalEarnings}`}
          sub={`${data.completedSessions} paid sessions`}
          color="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
            Session Metrics
          </h3>
          <div className="space-y-4">
            {[
              {
                label: 'Completion Rate',
                value: `${completionRate}%`,
                max: 100,
                color: 'bg-emerald-500',
              },
              {
                label: 'Cancellation Rate',
                value: `${cancelRate}%`,
                max: 100,
                color: cancelRate > 10 ? 'bg-rose-500' : 'bg-emerald-500',
              },
              {
                label: 'No-Show Rate',
                value: `${data.noShowSessions > 0 ? Math.round((data.noShowSessions / data.totalSessions) * 100) : 0}%`,
                max: 100,
                color: 'bg-amber-500',
              },
              {
                label: 'Client Retention',
                value: `${data.clientRetentionRate}%`,
                max: 100,
                color: data.clientRetentionRate > 50 ? 'bg-emerald-500' : 'bg-amber-500',
              },
              {
                label: 'Utilization Rate',
                value: `${data.utilizationRate}%`,
                max: 100,
                color: data.utilizationRate > 50 ? 'bg-emerald-500' : 'bg-amber-500',
              },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">{metric.label}</span>
                  <span className="text-white font-bold">{metric.value}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${metric.color}`}
                    style={{ width: `${Math.min(parseInt(metric.value), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
            Rating Distribution
          </h3>
          {data.averageRating > 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-6xl font-black text-white">
                  {data.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(data.averageRating) ? 'fill-current' : 'text-white/20'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/40 mt-2">Based on completed sessions</p>
              </div>
            </div>
          ) : (
            <p className="text-white/20 text-sm py-8 text-center">No ratings yet</p>
          )}
        </div>
      </div>

      {data.periodSessions.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
            Session Activity (30 days)
          </h3>
          <div className="flex items-end gap-1 h-40">
            {data.periodSessions.map((day, i) => {
              const maxCount = Math.max(...data.periodSessions.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-full mb-1 text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded whitespace-nowrap z-10">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    : {day.count}
                  </div>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-purple-500/40 to-purple-400/20 hover:from-purple-500/60 transition-all cursor-pointer"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-[8px] text-white/20">{new Date(day.date).getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
