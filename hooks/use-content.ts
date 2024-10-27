import { useState, useCallback, useEffect, useMemo } from 'react';
import { APIClient } from '@/lib/api';
import { Content } from '@/lib/types';
import { toast } from 'sonner';

interface ContentState {
  content: Content[];
  isLoading: boolean;
  error: string | null;
}

interface UseContentReturn extends ContentState {
  fetchContent: () => Promise<void>;
  updateTheme: (contentId: string, themeId: string) => Promise<void>;
}

export function useContent(): UseContentReturn {
  // Combined state management
  const [state, setState] = useState<ContentState>({
    content: [],
    isLoading: true, // Start true for initial load
    error: null,
  });

  // Memoize API client
  const api = useMemo(() => new APIClient(), []);

  // Fetch content with error handling
  const fetchContent = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await api.fetchContent();
      setState(prev => ({
        ...prev,
        content: data,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to load content';

      console.error('Content fetch failed:', error);
      setState(prev => ({
        ...prev,
        error: message,
        isLoading: false,
      }));
      toast.error(message);
    }
  }, [api]);

  // Update theme with optimistic updates and rollback
  const updateTheme = useCallback(async (contentId: string, themeId: string) => {
    // Store previous state for rollback
    const previousContent = state.content;

    // Optimistically update UI
    setState(prev => ({
      ...prev,
      content: prev.content.map(item =>
        item.id === contentId ? { ...item, themeId } : item
      ),
    }));

    try {
      await api.updateTheme(contentId, themeId);
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Theme update failed:', error);
      toast.error('Failed to update theme');

      // Rollback on error
      setState(prev => ({
        ...prev,
        content: previousContent,
      }));
    }
  }, [api, state.content]);

  // Initial fetch on mount
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Auto-refresh content when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchContent();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchContent]);

  return {
    content: state.content,
    isLoading: state.isLoading,
    error: state.error,
    fetchContent,
    updateTheme,
  };
}

// Error boundary component for content errors
export function ContentErrorBoundary({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="p-4 border rounded-md bg-destructive/10">
      <h3 className="font-semibold mb-2">Error Loading Content</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <button 
        onClick={onRetry}
        className="text-sm text-primary hover:underline"
      >
        Try Again
      </button>
    </div>
  );
}

// Usage example:
/*
function ContentList() {
  const { 
    content, 
    isLoading, 
    error, 
    fetchContent, 
    updateTheme 
  } = useContent();

  if (isLoading) {
    return <div>Loading content...</div>;
  }

  if (error) {
    return (
      <ContentErrorBoundary 
        error={error} 
        onRetry={fetchContent} 
      />
    );
  }

  return (
    <div>
      {content.map(item => (
        <div key={item.id}>
          {item.text}
          <button onClick={() => updateTheme(item.id, 'new-theme')}>
            Update Theme
          </button>
        </div>
      ))}
    </div>
  );
}
*/