import { useState, useCallback } from 'react';
import { APIClient } from '@/lib/api';
import { Content } from '@/lib/types';
import { toast } from 'sonner';

export function useContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const api = new APIClient();

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchContent();
      setContent(data);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { content, isLoading, fetchContent };
}