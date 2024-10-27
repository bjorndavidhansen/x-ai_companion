// use-content.ts
import { useState, useCallback, useEffect } from 'react';
import { APIClient } from '@/lib/api';
import { Content } from '@/lib/types';
import { toast } from 'sonner';

export function useContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = new APIClient();

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchContent();
      setContent(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load content';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const updateTheme = useCallback(async (contentId: string, themeId: string) => {
    try {
      await api.updateTheme(contentId, themeId);
      // Optimistically update local state
      setContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, themeId } : item
      ));
      toast.success('Theme updated successfully');
    } catch (error) {
      toast.error('Failed to update theme');
      // Revert on error
      fetchContent();
    }
  }, [api, fetchContent]);

  return { 
    content, 
    isLoading, 
    error, 
    fetchContent, 
    updateTheme 
  };
}