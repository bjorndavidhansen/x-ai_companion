'use client';

import { Component, type ReactNode } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  RotateCw, 
  Home, 
  ArrowLeft, 
  RefreshCw,
  LifeBuoy 
} from 'lucide-react';
import { toast } from 'sonner';

// Enhanced error tracking types
interface ErrorContext {
  readonly message: string;
  readonly stack?: string;
  readonly componentStack: string;
  readonly timestamp: string;
  readonly url: string;
  readonly userAgent: string;
  readonly pathname: string;
  readonly retryAttempts: number;
  readonly appVersion?: string;
  readonly lastAction?: string;
  readonly userId?: string;
}

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, context: ErrorContext) => void;
  readonly supportEmail?: string;
  readonly retryCount?: number;
  readonly userId?: string;
  readonly appVersion?: string;
}

interface ErrorInfo {
  readonly componentStack: string;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
  readonly errorInfo: ErrorInfo | null;
  readonly retryAttempts: number;
  readonly lastAction: string;
}

// Error type definitions for better error handling
type NetworkError = Error & { code?: string };
type ValidationError = Error & { fieldErrors?: Record<string, string[]> };
type AuthError = Error & { statusCode?: number };

// Error utilities
const isNetworkError = (error: Error): error is NetworkError => {
  return error.message.toLowerCase().includes('network') || 
         error.message.toLowerCase().includes('fetch') ||
         (error as NetworkError).code === 'NETWORK_ERROR';
};

const isValidationError = (error: Error): error is ValidationError => {
  return error.message.toLowerCase().includes('validation') || 
         !!(error as ValidationError).fieldErrors;
};

const isAuthError = (error: Error): error is AuthError => {
  return error.message.toLowerCase().includes('unauthorized') || 
         (error as AuthError).statusCode === 401;
};

// Loading fallback component
const LoadingFallback = (): ReactNode => (
  <Card className="max-w-2xl mx-auto my-8 animate-pulse">
    <CardHeader className="space-y-2">
      <div className="h-6 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </CardContent>
    <CardFooter>
      <div className="h-10 bg-muted rounded w-32"></div>
    </CardFooter>
  </Card>
);

// Error boundary component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private readonly maxRetries: number;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      retryAttempts: 0,
      lastAction: ''
    };
    this.maxRetries = props.retryCount ?? 3;
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  private createErrorContext = (error: Error, errorInfo: ErrorInfo): ErrorContext => {
    const { userId, appVersion } = this.props;
    const { retryAttempts, lastAction } = this.state;

    return {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      pathname: window.location.pathname,
      retryAttempts,
      lastAction,
      appVersion,
      userId
    };
  };

  componentDidCatch = (error: Error, errorInfo: ErrorInfo): void => {
    const errorContext = this.createErrorContext(error, errorInfo);

    // Enhanced error tracking
    this.trackError(error, errorContext);
    
    this.setState({
      error,
      errorInfo
    });
    
    toast.error(this.getErrorTitle(error), {
      description: this.getErrorDescription(error),
    });
  };

  private trackError = (error: Error, context: ErrorContext): void => {
    // Log to error tracking service
    this.props.onError?.(error, context);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Boundary Error');
      console.error('Error:', error);
      console.error('Context:', context);
      console.groupEnd();
    }
  };

  private getErrorTitle = (error: Error): string => {
    if (isNetworkError(error)) return 'Network Error';
    if (isValidationError(error)) return 'Validation Error';
    if (isAuthError(error)) return 'Authentication Error';
    return 'An unexpected error occurred';
  };

  private getErrorDescription = (error: Error): string => {
    if (isNetworkError(error)) {
      return 'Please check your internet connection and try again.';
    }
    if (isValidationError(error)) {
      return 'Please check your input and try again.';
    }
    if (isAuthError(error)) {
      return 'Your session may have expired. Please sign in again.';
    }
    return 'We apologize for the inconvenience. Our team has been notified.';
  };

  private handleRetry = async (): Promise<void> => {
    if (this.state.retryAttempts >= this.maxRetries) {
      toast.error('Maximum retry attempts reached', {
        description: 'Please try refreshing the page or contact support.',
      });
      return;
    }

    this.setState(prevState => ({
      error: null,
      errorInfo: null,
      retryAttempts: prevState.retryAttempts + 1,
      lastAction: 'retry'
    }));
  };

  private handleRefresh = (): void => {
    this.setState({ lastAction: 'refresh' }, () => {
      window.location.reload();
    });
  };

  private handleBack = (): void => {
    this.setState({ lastAction: 'back' }, () => {
      window.history.back();
    });
  };

  private handleSupport = (): void => {
    const { supportEmail = 'support@example.com' } = this.props;
    const { error, errorInfo } = this.state;
    const errorContext = error && errorInfo ? 
      this.createErrorContext(error, errorInfo) : 
      null;

    const subject = encodeURIComponent('Error Report');
    const body = encodeURIComponent(`
Error Details:
${error?.message}

URL: ${window.location.href}
Time: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
${errorContext ? `\nError Context:\n${JSON.stringify(errorContext, null, 2)}` : ''}
`);

    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  render(): ReactNode {
    const { error, errorInfo, retryAttempts } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      if (fallback) {
        return fallback;
      }

      return (
        <Card className="max-w-2xl mx-auto my-8">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-semibold">{this.getErrorTitle(error)}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {this.getErrorDescription(error)}
            </p>
            {retryAttempts > 0 && (
              <p className="text-xs text-muted-foreground">
                Retry attempt {retryAttempts} of {this.maxRetries}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Error Details:</p>
                <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                  {error.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2 justify-end">
            <Button 
              variant="outline"
              onClick={this.handleBack}
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex-1 sm:flex-none"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button 
              variant="outline"
              onClick={this.handleSupport}
              className="flex-1 sm:flex-none"
            >
              <LifeBuoy className="h-4 w-4 mr-2" />
              Get Help
            </Button>
            <Button 
              variant="outline"
              onClick={this.handleRefresh}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={this.handleRetry}
              disabled={retryAttempts >= this.maxRetries}
              className="flex-1 sm:flex-none"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return children;
  }
}

// Hook for easier consumption
export const useErrorBoundary = () => {
  const handleError = (error: Error, context: ErrorContext) => {
    // Custom error handling logic here
    console.error('Error caught by useErrorBoundary:', error, context);
  };

  return { ErrorBoundary, onError: handleError };
};

export type { 
  ErrorBoundaryProps, 
  ErrorBoundaryState, 
  ErrorContext, 
  ErrorInfo,
  NetworkError,
  ValidationError,
  AuthError
};