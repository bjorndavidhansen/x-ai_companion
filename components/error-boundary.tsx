'use client';

import { Component, ReactNode } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface State {
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to error tracking service
    this.props.onError?.(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    toast.error('An unexpected error occurred', {
      description: 'We apologize for the inconvenience. Our team has been notified.',
    });
  }

  private handleReset = () => {
    this.setState({ error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="max-w-2xl mx-auto my-8">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              We encountered an unexpected error. Our team has been notified.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button 
              onClick={this.handleReset}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}