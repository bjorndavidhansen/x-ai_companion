// use-themes.ts
import { useState, useEffect, useCallback } from 'react';
import { APIClient } from '@/lib/api';
import { Theme } from '@/lib/types';
import { toast } from 'sonner';

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = new APIClient();

  const fetchThemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchThemes();
      setThemes(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load themes';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const addTheme = useCallback(async (theme: Omit<Theme, 'id'>) => {
    try {
      const newTheme = await api.createTheme(theme);
      setThemes(prev => [...prev, newTheme]);
      toast.success('Theme created successfully');
      return newTheme;
    } catch (error) {
      toast.error('Failed to create theme');
      throw error;
    }
  }, [api]);

  return { 
    themes, 
    isLoading, 
    error,
    fetchThemes,
    addTheme,
  };
}