// use-auth.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthClient } from '@/lib/auth';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<null | { id: string; username: string }>(null);
  const authClient = new AuthClient();

  useEffect(() => {
    const tokens = authClient.getTokens();
    setIsAuthenticated(!!tokens);
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/x`;
      // Store current path for redirect after auth
      localStorage.setItem('authRedirect', window.location.pathname);
      window.location.href = redirectUrl;
    } catch (error) {
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      authClient.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, isAuthenticated, user, login, logout };
}