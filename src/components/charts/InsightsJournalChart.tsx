'use client';

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

type InsightsJournalChartProps = {
  journalEntries: { timestamp: string; content: string }[];
};

export default function InsightsJournalChart({ journalEntries }: InsightsJournalChartProps) {
  const journalData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dayRecords = journalEntries.filter((r) => isSameDay(new Date(r.timestamp), d));
    const totalWords = dayRecords.reduce((acc, r) => acc + r.content.split(' ').length, 0);
    return { name: format(d, 'EEE'), words: totalWords };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={journalData}>
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
          itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
        />
        <Line
          type="monotone"
          dataKey="words"
          stroke="#F59E0B"
          strokeWidth={4}
          dot={{ r: 6, fill: '#F59E0B' }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
