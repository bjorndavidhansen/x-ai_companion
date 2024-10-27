'use client';

import { useThemes } from '@/hooks/use-themes';
import { Theme } from '@/lib/types';
import { ThemeDistributionChart } from './theme-chart';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, List, RefreshCw } from 'lucide-react';

function ThemeManagerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeList({ themes }: { themes: Theme[] }) {
  return (
    <div className="space-y-4">
      {themes.map((theme) => (
        <div 
          key={theme.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{theme.name}</h3>
              <Badge variant={theme.confidence > 0.7 ? "default" : "secondary"}>
                {Math.round(theme.confidence * 100)}% confidence
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {theme.contentCount} {theme.contentCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <List className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ThemeManager() {
  const { themes, isLoading, error, refetch } = useThemes();
  
  if (error) {
    return (
      <Card className="p-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-red-500">Error Loading Themes</h2>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (isLoading) {
    return <ThemeManagerSkeleton />;
  }

  if (!themes.length) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">No Themes Found</h2>
          <CardDescription>
            Start interacting with content to generate themes
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Theme Analysis</h2>
            <CardDescription>
              Distribution of content across detected themes
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">
              <PieChart className="h-4 w-4 mr-2" />
              Chart View
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="p-4">
            <ThemeDistributionChart themes={themes} />
          </TabsContent>
          
          <TabsContent value="list" className="p-4">
            <ThemeList themes={themes} />
          </TabsContent>
        </CardContent>
      </Card>
    </Card>
  );
}