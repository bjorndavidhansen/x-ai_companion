'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Theme } from '@/lib/types';

const CHART_COLORS = [
  'var(--theme-color-1, #4f46e5)',  // Primary
  'var(--theme-color-2, #14b8a6)',  // Secondary
  'var(--theme-color-3, #f59e0b)',  // Warning
  'var(--theme-color-4, #ef4444)',  // Danger
  'var(--theme-color-5, #8b5cf6)',  // Info
];

interface ThemeChartProps {
  themes: Theme[];
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Theme & { percentage: number };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.[0]) return null;
  
  const data = payload[0].payload;
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        Content Items: {data.contentCount}
      </p>
      <p className="text-sm text-muted-foreground">
        Confidence: {Math.round(data.confidence * 100)}%
      </p>
    </div>
  );
};

function renderCustomizedLabel(
  cx: number, 
  cy: number, 
  midAngle: number, 
  innerRadius: number, 
  outerRadius: number, 
  percentage: number
) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is significant enough
  if (percentage < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  );
}

export function ThemeDistributionChart({ themes, height = 400 }: ThemeChartProps) {
  // Calculate percentages and sort by content count
  const processedData = themes
    .map(theme => ({
      ...theme,
      percentage: (theme.contentCount / themes.reduce((acc, t) => acc + t.contentCount, 0)) * 100
    }))
    .sort((a, b) => b.contentCount - a.contentCount);

  // Filter out themes with very low percentages for better visualization
  const significantThemes = processedData.filter(theme => theme.percentage >= 1);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={significantThemes}
          dataKey="contentCount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={Math.min(height * 0.35, 150)}
          innerRadius={Math.min(height * 0.2, 60)}
          labelLine={false}
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            percentage,
          }) => renderCustomizedLabel(cx, cy, midAngle, innerRadius, outerRadius, percentage)}
        >
          {significantThemes.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip />} 
          animationDuration={200}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}