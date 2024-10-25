// This is the complete content for components/theme-chart.tsx
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Theme } from '@/lib/types';

export function ThemeDistributionChart({ themes }: { themes: Theme[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={themes}
          dataKey="contentCount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
        >
          {themes.map((_, index) => (
            <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}