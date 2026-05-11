'use client';

import { useState, useEffect } from 'react';
import { format, subDays, isSameDay } from 'date-fns';

type InsightsChartsProps = {
  sleepHistory: { date: string; durationHours: number }[];
  journalEntries: { timestamp: string; content: string }[];
};

export function InsightsSleepChart({
  sleepHistory,
}: {
  sleepHistory: InsightsChartsProps['sleepHistory'];
}) {
  const [Recharts, setRecharts] = useState<typeof import('recharts') | null>(null);

  useEffect(() => {
    import('recharts').then(setRecharts);
  }, []);

  const sleepData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayRecords = sleepHistory.filter((r) => isSameDay(new Date(r.date), d));
    const totalHours = dayRecords.reduce((acc, r) => acc + (r.durationHours || 0), 0);
    return { name: format(d, 'EEE'), hours: totalHours };
  });

  if (!Recharts) return <div className="w-full h-64 bg-white/5 animate-pulse rounded-2xl" />;

  const { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } = Recharts;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sleepData}>
        <XAxis
          dataKey="name"
          stroke="rgba(255,255,255,0.3)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#0A0C0B',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
          }}
          itemStyle={{ color: '#818CF8', fontWeight: 'bold' }}
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
        />
        <Bar dataKey="hours" fill="#818CF8" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default InsightsSleepChart;
