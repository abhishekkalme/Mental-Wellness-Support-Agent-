'use client';

import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

const sleepAtTimeData = [
  { time: '22:00', value: 40 },
  { time: '00:00', value: 45 },
  { time: '02:00', value: 38 },
  { time: '04:00', value: 52 },
  { time: '06:00', value: 35 },
  { time: '08:00', value: 38 },
  { time: '10:00', value: 42 },
];

export default function SleepAtTimeChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={sleepAtTimeData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke="#22d3ee"
          strokeWidth={3}
          dot={{ fill: '#22d3ee', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: 'none',
            borderRadius: '12px',
            fontSize: '12px',
          }}
          itemStyle={{ color: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
