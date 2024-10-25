import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      // Redirect to X OAuth
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/x`;
    } catch (error) {
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, isAuthenticated, login };
}