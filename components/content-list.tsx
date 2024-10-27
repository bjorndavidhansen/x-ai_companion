'use client';

import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { Content, ContentType } from '@/lib/types';

// Configuration constants
const DEFAULTS = {
  SKELETON_COUNT: 5,
  INTERSECTION_THRESHOLD: 0.5,
  LOADING_DEBOUNCE_MS: 1000,
  CONTENT_LINE_CLAMP: 3,
  ROOT_MARGIN: '100px',
} as const;

// Configuration interface
interface ContentListConfig {
  readonly skeletonCount: number;
  readonly intersectionThreshold: number;
  readonly loadingDebounceMs: number;
  readonly contentLineClamp: number;
  readonly rootMargin: string;
}

// Props interfaces with readonly modifiers
interface ContentListProps {
  readonly content: ReadonlyArray<Content>;
  readonly isLoading: boolean;
  readonly onLoadMore?: () => void;
  readonly hasMore?: boolean;
  readonly error?: Error;
  readonly config?: Readonly<Partial<ContentListConfig>>;
  readonly onRetry?: () => void;
  readonly onItemClick?: (item: Readonly<Content>) => void;
}

interface ContentItemProps {
  readonly item: Readonly<Content>;
  readonly onClick?: (item: Readonly<Content>) => void;
  readonly lineClamp: number;
}

// Type styles mapping with readonly modifier and const assertion
const TYPE_STYLES: Readonly<Record<ContentType, { className: string; label: string }>> = {
  post: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', label: 'Post' },
  repost: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', label: 'Repost' },
  like: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', label: 'Like' },
  bookmark: { className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', label: 'Bookmark' }
} as const;

// Error component
const ContentError = ({ error, onRetry }: { readonly error: Error; readonly onRetry?: () => void }): ReactElement => (
  <Card className="p-6">
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="space-y-2">
        <p className="text-sm text-destructive">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-muted-foreground hover:text-foreground underline"
            aria-label="Retry loading content"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </Card>
);

// Empty state component
const EmptyState = (): ReactElement => (
  <Card className="p-6">
    <div className="flex flex-col items-center justify-center text-center space-y-2">
      <AlertCircle className="h-6 w-6 text-muted-foreground" />
      <p className="text-muted-foreground">No content found</p>
    </div>
  </Card>
);

// Skeleton component with explicit return type
const ContentItemSkeleton = (): ReactElement => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mt-2" />
    </CardContent>
  </Card>
);

// Content item component with proper memoization
const ContentItem = React.memo<ContentItemProps>(({ item, onClick, lineClamp }): ReactElement => {
  const timestamp = new Date(item.createdAt);
  const typeStyle = TYPE_STYLES[item.type];
  
  const handleClick = React.useCallback((): void => {
    onClick?.(item);
  }, [item, onClick]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(item);
    }
  }, [item, onClick]);

  const formattedDate = useMemo(() => 
    formatDistanceToNow(timestamp, { addSuffix: true }),
    [timestamp]
  );

  return (
    <Card 
      className="group hover:shadow-md transition-shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${typeStyle.label} from ${formattedDate}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle.className}`}
          >
            {typeStyle.label}
          </span>
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {formattedDate}
        </span>
      </CardHeader>
      <CardContent>
        <p className={`text-muted-foreground line-clamp-${lineClamp}`}>
          {item.text}
        </p>
        {item.themeId && (
          <div className="mt-2 text-sm text-muted-foreground">
            Theme: {item.themeId}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ContentItem.displayName = 'ContentItem';

// Loading state component
const LoadingState = ({ count }: { readonly count: number }): ReactElement => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, i) => (
      <ContentItemSkeleton key={i} />
    ))}
  </div>
);

// Main list component
export const ContentList = React.memo<ContentListProps>(({ 
  content, 
  isLoading, 
  onLoadMore,
  hasMore = false,
  error,
  config,
  onRetry,
  onItemClick
}: ContentListProps): ReactElement => {
  const observerRef = React.useRef<HTMLDivElement | null>(null);
  const loadingRef = React.useRef<boolean>(false);

  const {
    skeletonCount = DEFAULTS.SKELETON_COUNT,
    intersectionThreshold = DEFAULTS.INTERSECTION_THRESHOLD,
    loadingDebounceMs = DEFAULTS.LOADING_DEBOUNCE_MS,
    contentLineClamp = DEFAULTS.CONTENT_LINE_CLAMP,
    rootMargin = DEFAULTS.ROOT_MARGIN,
  } = config ?? {};

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && onLoadMore && !loadingRef.current) {
          loadingRef.current = true;
          onLoadMore();
          timeoutId = setTimeout(() => {
            loadingRef.current = false;
          }, loadingDebounceMs);
        }
      },
      { 
        threshold: intersectionThreshold,
        rootMargin
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [hasMore, onLoadMore, intersectionThreshold, loadingDebounceMs, rootMargin]);

  if (error) {
    return <ContentError error={error} onRetry={onRetry} />;
  }

  if (isLoading && content.length === 0) {
    return <LoadingState count={skeletonCount} />;
  }

  if (!isLoading && content.length === 0) {
    return <EmptyState />;
  }

  return useMemo(() => (
    <div className="space-y-4">
      {content.map((item) => (
        <ContentItem 
          key={item.id} 
          item={item} 
          onClick={onItemClick}
          lineClamp={contentLineClamp}
        />
      ))}
      {hasMore && (
        <div ref={observerRef} className="h-20">
          <ContentItemSkeleton />
        </div>
      )}
    </div>
  ), [content, hasMore, onItemClick, contentLineClamp]);
});

ContentList.displayName = 'ContentList';

export { type ContentListConfig };
export type { ContentListProps, ContentItemProps };