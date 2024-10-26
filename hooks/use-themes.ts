import { useState, useEffect } from 'react';
import { APIClient } from '@/lib/api';
import { Theme } from '@/lib/types';
import { toast } from 'sonner';

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const api = new APIClient();

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      try {
        const data = await api.fetchThemes();
        setThemes(data);
      } catch (error) {
        toast.error('Failed to load themes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemes();
  }, []);

  return { themes, isLoading };
}