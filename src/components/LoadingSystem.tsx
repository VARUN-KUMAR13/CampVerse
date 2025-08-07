import React from 'react';
import { Loader2, GraduationCap, Users, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Types
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface LoadingPageProps {
  message?: string;
  submessage?: string;
  progress?: number;
}

interface LoadingSkeletonProps {
  type: 'card' | 'list' | 'table' | 'profile' | 'dashboard' | 'placement';
  count?: number;
  className?: string;
}

// Simple loading spinner
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
};

// Full page loading with CampVerse branding
export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Loading CampVerse...',
  submessage = 'Please wait while we prepare your dashboard',
  progress,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Logo and branding */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CampVerse</h1>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">{submessage}</p>
        </div>

        {/* Progress bar if provided */}
        {progress !== undefined && (
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}

        {/* Floating icons animation */}
        <div className="relative h-12 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center space-x-8">
            <Users className="w-6 h-6 text-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
            <BookOpen className="w-6 h-6 text-muted-foreground animate-bounce" style={{ animationDelay: '200ms' }} />
            <Calendar className="w-6 h-6 text-muted-foreground animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading skeletons for different content types
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  count = 1,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-20 h-8" />
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            {/* Table rows */}
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="w-12 h-12 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="w-8 h-8 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="w-6 h-6 rounded" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'placement':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i} className="w-full">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="w-20 h-8 rounded-full" />
                    </div>
                    
                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-4 w-18" />
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-2">
                        <Skeleton className="w-16 h-6 rounded-full" />
                        <Skeleton className="w-12 h-6 rounded-full" />
                      </div>
                      <Skeleton className="w-24 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  return (
    <div className={cn('animate-pulse', className)}>
      {type === 'card' || type === 'profile' || type === 'dashboard' 
        ? renderSkeleton() 
        : Array.from({ length: count }).map((_, i) => (
            <div key={i} className={i > 0 ? 'mt-4' : ''}>
              {renderSkeleton()}
            </div>
          ))
      }
    </div>
  );
};

// Loading overlay for specific sections
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}> = ({ isLoading, children, message = 'Loading...' }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6">
            <CardContent className="flex items-center space-x-3">
              <LoadingSpinner />
              <span className="text-sm font-medium">{message}</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Button loading state
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  [key: string]: any;
}> = ({ loading, children, loadingText, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>{loadingText || 'Loading...'}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default {
  LoadingSpinner,
  LoadingPage,
  LoadingSkeleton,
  LoadingOverlay,
  LoadingButton,
};
