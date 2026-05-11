'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

type BreathingStatsProps = {
  history: { date: string; durationSeconds: number }[];
};

export default function BreathingChart({ history }: BreathingStatsProps) {
  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayRecords = history.filter((r) => isSameDay(new Date(r.date), d));
    const totalMinutes = dayRecords.reduce((acc, r) => acc + r.durationSeconds, 0) / 60;
    return {
      name: format(d, 'EEE'),
      minutes: Math.round(totalMinutes * 10) / 10,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="80%">
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}m`}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
          }}
          itemStyle={{ color: 'var(--color-primary)' }}
        />
        <Line
          type="monotone"
          dataKey="minutes"
          stroke="var(--color-primary)"
          strokeWidth={3}
          dot={{ r: 4, fill: 'var(--color-primary)' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
