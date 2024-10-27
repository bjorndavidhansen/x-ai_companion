'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Settings2, RefreshCcw } from 'lucide-react';
import { useThemes } from '@/hooks/use-themes';
import { ThemeDistributionChart } from '@/components/theme-chart';
import type { Theme } from '@/lib/types';

// Type definitions
interface UseThemesReturn {
  readonly themes: ReadonlyArray<Theme>;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly fetchThemes: () => Promise<void>;
}

interface ThemeListProps {
  readonly themes: ReadonlyArray<Theme>;
  readonly onThemeSelect?: (theme: Theme) => void;
  readonly selectedThemeId?: string | null;
}

interface ThemeListItemProps {
  readonly theme: Theme;
  readonly isSelected?: boolean;
  readonly onSelect?: (theme: Theme) => void;
}

// Helper functions
const formatConfidence = (confidence: number | undefined): string => {
  if (typeof confidence !== 'number') return 'N/A';
  return `${(confidence * 100).toFixed(1)}%`;
};

const formatCount = (count: number): string => count.toLocaleString();

const getBadgeVariant = (confidence: number | undefined): 'default' | 'secondary' => 
  typeof confidence === 'number' && confidence > 0.7 ? 'default' : 'secondary';

// Components
const ThemeListSkeleton: React.FC = (): JSX.Element => (
  <div className="space-y-3" role="status" aria-label="Loading themes">
    {Array.from({ length: 3 }, (_, i) => (
      <Card key={i} className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </Card>
    ))}
    <span className="sr-only">Loading themes...</span>
  </div>
);

const ThemeListEmpty: React.FC = (): JSX.Element => (
  <Alert>
    <AlertCircle className="h-4 w-4" aria-hidden="true" />
    <AlertDescription>
      No themes available. Themes will appear here once they are created.
    </AlertDescription>
  </Alert>
);

interface ThemeListErrorProps {
  error: Error;
  onRetry?: () => void;
}

const ThemeListError: React.FC<ThemeListErrorProps> = ({ error, onRetry }): JSX.Element => (
  <Alert variant="destructive" role="alert">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          Error loading themes: {error.message}
        </AlertDescription>
      </div>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="gap-2"
          aria-label="Retry loading themes"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  </Alert>
);

const ThemeListItem: React.FC<ThemeListItemProps> = React.memo(({ 
  theme, 
  isSelected, 
  onSelect 
}): JSX.Element => {
  const handleClick = React.useCallback(() => {
    onSelect?.(theme);
  }, [onSelect, theme]);

  const handleKeyPress = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(theme);
    }
  }, [onSelect, theme]);

  return (
    <Card 
      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'border-primary' : ''
      }`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Theme: ${theme.name}, Content count: ${formatCount(theme.contentCount)}, ${
        theme.confidence ? `Confidence: ${formatConfidence(theme.confidence)}` : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-medium">{theme.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCount(theme.contentCount)} items
          </p>
        </div>
        <Badge variant={getBadgeVariant(theme.confidence)}>
          {formatConfidence(theme.confidence)}
        </Badge>
      </div>
    </Card>
  );
});

ThemeListItem.displayName = 'ThemeListItem';

const ThemeList: React.FC<ThemeListProps> = ({ 
  themes,
  onThemeSelect,
  selectedThemeId
}): JSX.Element => {
  if (!themes.length) {
    return <ThemeListEmpty />;
  }

  return (
    <div 
      className="space-y-3" 
      role="list"
      aria-label="Theme list"
    >
      {themes.map((theme) => (
        <div key={theme.id} role="listitem">
          <ThemeListItem
            theme={theme}
            isSelected={selectedThemeId === theme.id}
            onSelect={onThemeSelect}
          />
        </div>
      ))}
    </div>
  );
};

export const ThemeManager: React.FC = (): JSX.Element => {
  const { 
    themes, 
    isLoading, 
    error, 
    fetchThemes 
  } = useThemes() as UseThemesReturn;

  const [selectedThemeId, setSelectedThemeId] = React.useState<string | null>(null);

  // Fetch themes on mount
  React.useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // Memoize sorted themes
  const sortedThemes = React.useMemo(() => 
    [...themes].sort((a, b) => b.contentCount - a.contentCount),
    [themes]
  );

  const handleThemeSelect = React.useCallback((theme: Theme) => {
    setSelectedThemeId(theme.id);
  }, []);

  const handleRetry = React.useCallback(async () => {
    try {
      await fetchThemes();
    } catch (error) {
      console.error('Failed to retry fetching themes:', error);
    }
  }, [fetchThemes]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Theme Distribution</CardTitle>
          <Settings2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          {error ? (
            <ThemeListError error={error} onRetry={handleRetry} />
          ) : (
            <ThemeDistributionChart 
              themes={sortedThemes}
              isLoading={isLoading}
              showConfidence
              onThemeClick={handleThemeSelect}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Themes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ThemeListSkeleton />
          ) : error ? (
            <ThemeListError error={error} onRetry={handleRetry} />
          ) : (
            <ThemeList 
              themes={sortedThemes}
              onThemeSelect={handleThemeSelect}
              selectedThemeId={selectedThemeId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// PropTypes for runtime type checking
ThemeListItem.propTypes = {
  theme: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    contentCount: PropTypes.number.isRequired,
    confidence: PropTypes.number
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func
};

ThemeList.propTypes = {
  themes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      contentCount: PropTypes.number.isRequired,
      confidence: PropTypes.number
    })
  ).isRequired,
  onThemeSelect: PropTypes.func,
  selectedThemeId: PropTypes.string
};

export type { ThemeListProps, ThemeListItemProps, UseThemesReturn };
export { ThemeList, ThemeListItem };