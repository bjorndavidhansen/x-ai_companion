'use client';

import { Content } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ContentListProps {
  content: Content[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function ContentItemSkeleton() {
  return <Skeleton className="h-[200px] w-full" />;
}

function ContentItem({ item }: { item: Content }) {
  const timestamp = new Date(item.createdAt);
  
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          <Badge variant={getVariantForType(item.type)} className="capitalize">
            {item.type}
          </Badge>
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{item.text}</p>
        {item.themeId && (
          <div className="mt-2 text-sm text-muted-foreground">
            Theme: {item.themeId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getVariantForType(type: Content['type']): 'default' | 'secondary' | 'destructive' {
  switch (type) {
    case 'post':
      return 'default';
    case 'repost':
      return 'secondary';
    case 'like':
    case 'bookmark':
      return 'destructive';
    default:
      return 'default';
  }
}

export function ContentList({ 
  content, 
  isLoading, 
  onLoadMore,
  hasMore = false 
}: ContentListProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView && hasMore && onLoadMore) {
        onLoadMore();
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ContentItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!content.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No content found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {content.map((item) => (
        <ContentItem key={item.id} item={item} />
      ))}
      {hasMore && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <Skeleton className="h-[200px] w-full" />
        </div>
      )}
    </div>
  );
}