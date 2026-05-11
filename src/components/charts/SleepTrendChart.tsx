'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

type SleepEntry = { date: string; durationHours: number };

export default function SleepTrendChart({ sleepHistory }: { sleepHistory: SleepEntry[] }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayRecords = sleepHistory.filter((r) => {
      try {
        const entryDate = new Date(r.date);
        return format(entryDate, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
      } catch {
        return false;
      }
    });
    const totalHours = dayRecords.reduce((acc, r) => acc + (r.durationHours || 0), 0);
    const isToday = i === 6;
    return { day: format(d, 'EEE'), hours: Math.round(totalHours * 10) / 10, active: isToday };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={last7} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          tickFormatter={(val) => `${val}h`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{
            background: '#1e293b',
            border: 'none',
            borderRadius: '12px',
            fontSize: '12px',
          }}
          itemStyle={{ color: '#fff' }}
        />
        <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={28}>
          {last7.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.active ? '#9333ea' : '#3b82f6'}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
