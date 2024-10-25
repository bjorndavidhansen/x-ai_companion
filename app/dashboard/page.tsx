'use client';

import { useEffect } from 'react';
import { useContent } from '@/hooks/use-content';
import { ContentList } from '@/components/content-list';
import { ThemeDistributionChart } from '@/components/theme-chart';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { content, isLoading, fetchContent } = useContent();

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Content Themes</h2>
          <ThemeDistributionChart 
            themes={[]} // TODO: Add theme data
          />
        </Card>
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Content</h2>
          <ContentList 
            content={content}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}