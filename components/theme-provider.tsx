'use client';

import * as React from "react";
import { 
  ThemeProvider as NextThemesProvider, 
  useTheme as useNextTheme 
} from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

// Define the available themes
export type Theme = 'light' | 'dark' | 'system';

interface ExtendedThemeProviderProps extends Omit<ThemeProviderProps, 'attribute'> {
  children: React.ReactNode;
  /**
   * Force a specific theme. Useful for emails and previews.
   */
  forcedTheme?: Theme;
  /**
   * Custom default theme. Defaults to system.
   */
  defaultTheme?: Theme;
  /**
   * Enable system theme detection. Defaults to true.
   */
  enableSystem?: boolean;
  /**
   * Disable all transitions when switching themes. Defaults to false.
   */
  disableTransitionOnChange?: boolean;
  /**
   * Define custom storage key for theme preference. Defaults to 'theme'.
   */
  storageKey?: string;
}

const STORAGE_KEY = 'x-activity-theme';
const FALLBACK_THEME: Theme = 'system';

export function ThemeProvider({
  children,
  forcedTheme,
  defaultTheme = FALLBACK_THEME,
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = STORAGE_KEY,
  ...props
}: ExtendedThemeProviderProps) {
  // If we're forcing a theme, ensure no theme switch flicker on load
  const [mounted, setMounted] = React.useState(false);

  // Handle forced theme for previews/emails
  const resolvedTheme = React.useMemo(() => {
    if (forcedTheme) return forcedTheme;
    return defaultTheme;
  }, [forcedTheme, defaultTheme]);

  // Add CSS variables for theme transitions
  React.useEffect(() => {
    if (!disableTransitionOnChange) {
      document.documentElement.style.setProperty(
        '--theme-transition',
        'background-color 0.2s ease-in-out, color 0.2s ease-in-out'
      );
    }
  }, [disableTransitionOnChange]);

  // Set mounted state after hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle initial system theme sync
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Update root class based on system preference if system theme is enabled
    const updateRootClass = (e: MediaQueryListEvent | MediaQueryList) => {
      if (enableSystem && !forcedTheme) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    // Initial check
    updateRootClass(mediaQuery);

    // Listen for system theme changes
    const listener = (e: MediaQueryListEvent) => updateRootClass(e);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [enableSystem, forcedTheme]);

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme={resolvedTheme}
      forcedTheme={forcedTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey}
      themes={['light', 'dark', 'system']}
    >
      <style jsx global>{`
        :root {
          --theme-transition: ${disableTransitionOnChange
            ? 'none'
            : 'background-color 0.2s ease-in-out, color 0.2s ease-in-out'};
        }
        
        /* Base transition styles */
        *, *::before, *::after {
          transition: var(--theme-transition);
        }

        /* Disable transitions on page load */
        .preload * {
          transition: none !important;
        }
      `}</style>

      {/* Only render children after mounted to prevent hydration mismatch */}
      {(!forcedTheme || mounted) && children}
    </NextThemesProvider>
  );
}

// Hook for using the theme in components
export function useTheme() {
  const context = useNextTheme();
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility function to get the current theme with error handling
export function getTheme(): Theme {
  if (typeof window === 'undefined') return FALLBACK_THEME;
  
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY) as Theme;
    return storedTheme || FALLBACK_THEME;
  } catch (error) {
    console.warn('Failed to access localStorage:', error);
    return FALLBACK_THEME;
  }
}