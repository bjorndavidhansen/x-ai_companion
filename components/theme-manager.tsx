'use client';

import { useThemes } from '@/hooks/use-themes';
import { 
  Card, 
  CardHeader, 
  CardContent 
} from '@/components/ui/card';
import { ThemeDistributionChart } from '@/components/theme-chart';

export function ThemeManager() {
  const { themes, isLoading } = useThemes();
  
  if (isLoading) {
    return <div>Loading themes...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Content Themes</h2>
      </CardHeader>
      <CardContent>
        <ThemeDistributionChart themes={themes} />
      </CardContent>
    </Card>
  );
}