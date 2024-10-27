import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { AuthClient } from '@/lib/auth';

interface User {
  id: string;
  username: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

interface UseAuthReturn extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  // State management with proper typing
  const [state, setState] = useState<AuthState>({
    isLoading: true, // Start as true to indicate initial auth check
    isAuthenticated: false,
    user: null,
  });

  // Memoize auth client instance
  const authClient = useMemo(() => new AuthClient(), []);

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokens = authClient.getTokens();
        setState(prev => ({
          ...prev,
          isAuthenticated: !!tokens,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Auth check failed:', error);
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    };

    checkAuth();
  }, [authClient]);

  // Login handler with error boundaries
  const login = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Validate environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      // Store current path for redirect after auth
      try {
        localStorage.setItem('authRedirect', window.location.pathname);
      } catch (error) {
        console.warn('Failed to store redirect path:', error);
      }

      // Redirect to auth endpoint
      window.location.href = `${apiUrl}/auth/x`;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Authentication failed. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Logout handler with proper cleanup
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authClient.clearTokens();
      
      // Reset all auth state
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
      
      // Reset loading state on error
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [authClient]);

  // Handle window focus for token refresh/validation
  useEffect(() => {
    const handleFocus = async () => {
      if (state.isAuthenticated) {
        try {
          const tokens = authClient.getTokens();
          if (!tokens) {
            // Token was cleared in another tab
            setState({
              isLoading: false,
              isAuthenticated: false,
              user: null,
            });
          }
        } catch (error) {
          console.error('Token validation failed:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [authClient, state.isAuthenticated]);

  return {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    login,
    logout,
  };
}

// Usage example:
/*
function MyComponent() {
  const { isLoading, isAuthenticated, user, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <button onClick={logout}>Logout {user?.username}</button>
  ) : (
    <button onClick={login}>Login with X</button>
  );
}
*/