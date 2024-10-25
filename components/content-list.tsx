'use client';

import { Content } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentListProps {
  content: Content[];
  isLoading: boolean;
}

export function ContentList({ content, isLoading }: ContentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {content.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{item.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}