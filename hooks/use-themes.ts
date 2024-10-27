import { useState, useEffect, useCallback, useMemo } from 'react';
import { APIClient } from '@/lib/api';
import { Theme } from '@/lib/types';
import { toast } from 'sonner';

interface ThemesState {
  themes: Theme[];
  isLoading: boolean;
  error: string | null;
}

interface UseThemesReturn extends ThemesState {
  fetchThemes: () => Promise<void>;
  addTheme: (theme: Omit<Theme, 'id'>) => Promise<Theme>;
  updateTheme: (id: string, updates: Partial<Theme>) => Promise<Theme>;
  deleteTheme: (id: string) => Promise<void>;
}

const initialState: ThemesState = {
  themes: [],
  isLoading: false,
  error: null,
};

export function useThemes(): UseThemesReturn {
  // Combined state management
  const [state, setState] = useState<ThemesState>(initialState);
  
  // Memoize API client
  const api = useMemo(() => new APIClient(), []);

  // Fetch themes with error handling
  const fetchThemes = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await api.fetchThemes();
      setState(prev => ({
        ...prev,
        themes: data,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to load themes';
      
      console.error('Failed to fetch themes:', error);
      setState(prev => ({
        ...prev,
        error: message,
        isLoading: false,
      }));
      toast.error(message);
    }
  }, [api]);

  // Add new theme with optimistic update
  const addTheme = useCallback(async (theme: Omit<Theme, 'id'>) => {
    try {
      const newTheme = await api.createTheme(theme);
      
      setState(prev => ({
        ...prev,
        themes: [...prev.themes, newTheme],
      }));
      
      toast.success('Theme created successfully');
      return newTheme;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to create theme';
      
      console.error('Failed to create theme:', error);
      toast.error(message);
      throw error;
    }
  }, [api]);

  // Update theme with optimistic update and rollback
  const updateTheme = useCallback(async (id: string, updates: Partial<Theme>) => {
    // Store current state for rollback
    const previousThemes = state.themes;

    // Optimistic update
    setState(prev => ({
      ...prev,
      themes: prev.themes.map(theme =>
        theme.id === id ? { ...theme, ...updates } : theme
      ),
    }));

    try {
      const updatedTheme = await api.updateTheme(id, updates);
      toast.success('Theme updated successfully');
      return updatedTheme;
    } catch (error) {
      // Rollback on error
      setState(prev => ({
        ...prev,
        themes: previousThemes,
      }));

      const message = error instanceof Error 
        ? error.message 
        : 'Failed to update theme';
      
      console.error('Failed to update theme:', error);
      toast.error(message);
      throw error;
    }
  }, [api, state.themes]);

  // Delete theme with optimistic update and rollback
  const deleteTheme = useCallback(async (id: string) => {
    // Store current state for rollback
    const previousThemes = state.themes;

    // Optimistic update
    setState(prev => ({
      ...prev,
      themes: prev.themes.filter(theme => theme.id !== id),
    }));

    try {
      await api.deleteTheme(id);
      toast.success('Theme deleted successfully');
    } catch (error) {
      // Rollback on error
      setState(prev => ({
        ...prev,
        themes: previousThemes,
      }));

      const message = error instanceof Error 
        ? error.message 
        : 'Failed to delete theme';
      
      console.error('Failed to delete theme:', error);
      toast.error(message);
      throw error;
    }
  }, [api, state.themes]);

  // Initial fetch
  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // Auto-refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchThemes();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchThemes]);

  return {
    themes: state.themes,
    isLoading: state.isLoading,
    error: state.error,
    fetchThemes,
    addTheme,
    updateTheme,
    deleteTheme,
  };
}

// Example usage:
/*
function ThemeManager() {
  const {
    themes,
    isLoading,
    error,
    addTheme,
    updateTheme,
    deleteTheme,
  } = useThemes();

  if (isLoading) {
    return <div>Loading themes...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {themes.map(theme => (
        <div key={theme.id}>
          <h3>{theme.name}</h3>
          <button onClick={() => updateTheme(theme.id, { name: 'Updated' })}>
            Update
          </button>
          <button onClick={() => deleteTheme(theme.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => addTheme({ name: 'New Theme', contentCount: 0 })}>
        Add Theme
      </button>
    </div>
  );
}
*/