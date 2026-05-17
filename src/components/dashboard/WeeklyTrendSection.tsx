'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import type { WeekDayData } from '@/app/(app)/dashboard/hooks';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function WeeklyTrendSection({ weekData }: { weekData: WeekDayData[] }) {
  const hasAny = weekData.some((d) => d.count > 0);
  if (!hasAny) return null;

  const activeDays = weekData.filter((d) => d.active).length;
  const totalEntries = weekData.reduce((s, d) => s + d.count, 0);

  const chartData = weekData.map((d) => ({
    day: d.short,
    value: d.count,
    fill: d.active ? '#E2FF6F' : 'rgba(255,255,255,0.08)',
    isToday: format(d.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
  }));

  return (
    <motion.div variants={itemVariants} className="surface-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#E2FF6F]" />
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Weekly Trend</h2>
        </div>
        <span className="text-sm font-bold text-[#E2FF6F] tabular-nums">
          {Math.round((activeDays / 7) * 100)}%
        </span>
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 600 }}
            />
            <YAxis hide domain={[0, 5]} />
            <Tooltip
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#1a1d1b] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                    <p className="text-white font-bold text-sm mb-1.5">
                      {weekData.find((w) => w.short === d.day)?.day || d.day}
                    </p>
                    <p className="text-xs text-white/60">
                      <span className="text-[#E2FF6F] font-bold">{d.value}</span> activities logged
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} className={entry.isToday ? 'opacity-100' : ''} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-white/30 border-t border-white/5 pt-3 mt-1">
        <span>
          <span className="text-white font-bold tabular-nums">{activeDays}</span>/7 active days
        </span>
        <span>
          <span className="text-white font-bold tabular-nums">{totalEntries}</span> total entries
        </span>
      </div>
    </motion.div>
  );
}
