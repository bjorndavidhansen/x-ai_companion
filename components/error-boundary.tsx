'use client';

import { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
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
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to your error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
    toast.error('Something went wrong');
  }

  render() {
    if (this.state.error) {
      return (
        <Card className="p-6 m-4">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
            {this.state.error.toString()}
          </pre>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try again
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}