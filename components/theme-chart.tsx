'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Theme } from '@/lib/types';

// Constants
const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))'
} as const;

const CHART_COLOR_ARRAY = Object.values(CHART_COLORS);

const DEFAULTS = {
  MIN_PERCENTAGE: 1,
  MIN_HEIGHT: 300,
  MAX_HEIGHT: 600,
  INNER_RADIUS_RATIO: 0.2,
  OUTER_RADIUS_RATIO: 0.35,
  MAX_RADIUS: 150,
  LABEL_MIN_PERCENTAGE: 5,
  TOOLTIP_ANIMATION_DURATION: 200,
  LEGEND_PADDING_TOP: 20
} as const;

// Types
interface ThemeChartProps {
  readonly themes: ReadonlyArray<Theme>;
  readonly height?: number;
  readonly isLoading?: boolean;
  readonly minPercentage?: number;
  readonly showConfidence?: boolean;
  readonly onThemeClick?: (theme: Theme) => void;
}

interface ProcessedTheme extends Theme {
  readonly percentage: number;
  readonly color: string;
}

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: ProcessedTheme;
  }>;
  readonly showConfidence?: boolean;
}

// Helper functions
const calculatePercentage = (count: number, total: number): number => 
  (count / total) * 100;

const processThemeData = (
  themes: ReadonlyArray<Theme>, 
  minPercentage: number
): ReadonlyArray<ProcessedTheme> => {
  const totalCount = themes.reduce((acc, theme) => acc + theme.contentCount, 0);
  
  return themes
    .map((theme, index) => ({
      ...theme,
      percentage: calculatePercentage(theme.contentCount, totalCount),
      color: CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
    }))
    .filter(theme => theme.percentage >= minPercentage)
    .sort((a, b) => b.contentCount - a.contentCount);
};

// Components
const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  showConfidence 
}) => {
  if (!active || !payload?.[0]) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        Content Items: {data.contentCount.toLocaleString()}
      </p>
      <p className="text-sm text-muted-foreground">
        Percentage: {data.percentage.toFixed(1)}%
      </p>
      {showConfidence && typeof data.confidence === 'number' && (
        <p className="text-sm text-muted-foreground">
          Confidence: {(data.confidence * 100).toFixed(1)}%
        </p>
      )}
    </div>
  );
};

const ChartLabel: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly midAngle: number;
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly percentage: number;
}> = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percentage < DEFAULTS.LABEL_MIN_PERCENTAGE) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium fill-current"
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  );
};

const LoadingState: React.FC<{ readonly height: number }> = ({ height }) => (
  <div 
    className="flex items-center justify-center" 
    style={{ height }}
    aria-label="Loading chart"
  >
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

const EmptyState: React.FC = () => (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      No theme data available to display.
    </AlertDescription>
  </Alert>
);

export const ThemeDistributionChart: React.FC<ThemeChartProps> = ({ 
  themes,
  height = DEFAULTS.MIN_HEIGHT,
  isLoading = false,
  minPercentage = DEFAULTS.MIN_PERCENTAGE,
  showConfidence = false,
  onThemeClick
}) => {
  const chartHeight = Math.min(
    Math.max(height, DEFAULTS.MIN_HEIGHT),
    DEFAULTS.MAX_HEIGHT
  );

  const processedThemes = useMemo(() => 
    processThemeData(themes, minPercentage),
    [themes, minPercentage]
  );

  // Handle loading state
  if (isLoading) {
    return <LoadingState height={chartHeight} />;
  }

  // Handle empty state
  if (!themes.length) {
    return <EmptyState />;
  }

  // If no themes meet the minimum percentage threshold
  if (!processedThemes.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No themes meet the minimum percentage threshold of {minPercentage}%.
        </AlertDescription>
      </Alert>
    );
  }

  const handleClick = (data: ProcessedTheme) => {
    onThemeClick?.(data);
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie
          data={processedThemes}
          dataKey="contentCount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={Math.min(chartHeight * DEFAULTS.OUTER_RADIUS_RATIO, DEFAULTS.MAX_RADIUS)}
          innerRadius={Math.min(chartHeight * DEFAULTS.INNER_RADIUS_RATIO, DEFAULTS.MAX_RADIUS * 0.4)}
          labelLine={false}
          onClick={handleClick}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => (
            <ChartLabel
              cx={cx}
              cy={cy}
              midAngle={midAngle}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              percentage={percentage}
            />
          )}
        >
          {processedThemes.map((theme) => (
            <Cell 
              key={theme.id}
              fill={theme.color}
              className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip showConfidence={showConfidence} />} 
          animationDuration={DEFAULTS.TOOLTIP_ANIMATION_DURATION}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ paddingTop: DEFAULTS.LEGEND_PADDING_TOP }}
          formatter={(value: string) => (
            <span className="text-sm text-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export type { ThemeChartProps, ProcessedTheme };