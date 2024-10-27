'use client';

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
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
    if (!enableSystem) return defaultTheme;
    return defaultTheme;
  }, [forcedTheme, enableSystem, defaultTheme]);

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
    mediaQuery.addEventListener('change', updateRootClass);

    return () => mediaQuery.removeEventListener('change', updateRootClass);
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
      {/* Prevent theme switch flicker on load when using forced themes */}
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
  const context = React.useContext(NextThemesProvider);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility function to get the current theme
export function getTheme(): Theme {
  if (typeof window === 'undefined') return FALLBACK_THEME;
  return (localStorage.getItem(STORAGE_KEY) as Theme) || FALLBACK_THEME;
}

// Example usage:
/*
import { ThemeProvider } from './theme-provider'

// In your app layout:
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          defaultTheme="system"
          enableSystem={true}
          storageKey="x-activity-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// For email previews or static rendering:
<ThemeProvider forcedTheme="light">
  <EmailPreview />
</ThemeProvider>
*/