'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const defaultData = [
  { name: 'Physical', value: 10, color: '#10b981' },
  { name: 'Emotional', value: 10, color: '#f43f5e' },
  { name: 'Mental', value: 10, color: '#8b5cf6' },
  { name: 'Sleep', value: 20, color: '#3b82f6' },
  { name: 'Spiritual', value: 10, color: '#f59e0b' },
  { name: 'Social', value: 10, color: '#10b981' },
];

export default function WellbeingPieChart({
  metrics,
}: {
  metrics?: {
    mental: number;
    emotional: number;
    physical: number;
    social: number;
    sleep: number;
    spiritual: number;
  };
}) {
  const data = metrics
    ? [
        { name: 'Physical', value: Math.round(metrics.physical / 10), color: '#10b981' },
        { name: 'Emotional', value: Math.round(metrics.emotional / 10), color: '#f43f5e' },
        { name: 'Mental', value: Math.round(metrics.mental / 10), color: '#8b5cf6' },
        { name: 'Sleep', value: Math.round(metrics.sleep / 10), color: '#3b82f6' },
        { name: 'Spiritual', value: Math.round(metrics.spiritual / 10), color: '#f59e0b' },
        { name: 'Social', value: Math.round(metrics.social / 10), color: '#10b981' },
      ]
    : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius="75%"
          outerRadius="90%"
          paddingAngle={5}
          dataKey="value"
          startAngle={180}
          endAngle={-180}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
