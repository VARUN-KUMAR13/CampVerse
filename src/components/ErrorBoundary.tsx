import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Report error to external service in production
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real application, you would send this to your error reporting service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        userId: localStorage.getItem('user_id') || 'anonymous',
      };

      // Example API call to error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });

      console.log('Error report generated:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    } else {
      this.handleReload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2)).then(() => {
      console.log('Error details copied to clipboard');
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-lg">
                We encountered an unexpected error. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID for support */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Error ID (for support):
                </p>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded border">
                  {this.state.errorId}
                </code>
              </div>

              {/* Error message in development */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-2">
                    Development Error Details:
                  </p>
                  <code className="text-xs font-mono text-destructive block whitespace-pre-wrap">
                    {this.state.error.message}
                  </code>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-destructive cursor-pointer">
                        Stack Trace
                      </summary>
                      <code className="text-xs font-mono text-destructive block whitespace-pre-wrap mt-2">
                        {this.state.error.stack}
                      </code>
                    </details>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  disabled={this.retryCount >= this.maxRetries}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.retryCount >= this.maxRetries ? 'Max Retries Reached' : 'Try Again'}
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {/* Copy error details for support */}
              {import.meta.env.DEV && (
                <Button 
                  onClick={this.copyErrorDetails}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Copy Error Details for Support
                </Button>
              )}

              {/* Help text */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please contact support with the error ID above.
                </p>
                <p className="mt-1">
                  Email: support@campverse.edu • Phone: +91-XXX-XXX-XXXX
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for manually triggering error boundary
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    // Create a synthetic error that will be caught by ErrorBoundary
    throw new Error(`Manual Error: ${error.message}${errorInfo ? ` | Info: ${errorInfo}` : ''}`);
  };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
