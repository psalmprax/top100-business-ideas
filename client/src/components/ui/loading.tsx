/**
 * Loading States and Error Handling Components
 */

import { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  text,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`${sizeClasses[size]} border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin`}
      />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
}

// Full Screen Loading Component
interface FullScreenLoadingProps {
  text?: string;
}

export function FullScreenLoading({
  text = "Loading...",
}: FullScreenLoadingProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

// Skeleton Loading Component
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-700 rounded ${className}`} />;
}

// Skeleton Card Component
export function SkeletonCard() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="pt-6">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

// Skeleton Table Component
interface SkeletonTableProps {
  rows?: number;
}

export function SkeletonTable({ rows = 5 }: SkeletonTableProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

// Error Display Component
interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="bg-slate-800 border-red-500/30 max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-slate-400 mb-4">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-slate-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Not Found Component
interface NotFoundProps {
  title?: string;
  message?: string;
}

export function NotFound({
  title = "Page not found",
  message = "The page you're looking for doesn't exist.",
}: NotFoundProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Card className="bg-slate-800 border-slate-700 max-w-md">
        <CardContent className="pt-6 text-center">
          <h1 className="text-6xl font-bold text-slate-700 mb-4">404</h1>
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-slate-400 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      {icon && <div className="mb-4 text-slate-500">{icon}</div>}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// Page Transition Wrapper
interface PageTransitionProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function PageTransition({ children, isLoading }: PageTransitionProps) {
  if (isLoading) {
    return <FullScreenLoading />;
  }
  return <>{children}</>;
}

// Async Data Wrapper
interface AsyncDataWrapperProps<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  children: (data: T) => ReactNode;
}

export function AsyncDataWrapper<T>({
  isLoading,
  error,
  data,
  loadingComponent,
  errorComponent,
  children,
}: AsyncDataWrapperProps<T>) {
  if (isLoading) {
    return loadingComponent || <SkeletonCard />;
  }

  if (error) {
    return errorComponent || <ErrorDisplay message={error.message} />;
  }

  if (data === null) {
    return <EmptyState title="No data available" />;
  }

  return <>{children(data)}</>;
}

// Button Loading State
interface LoadingButtonProps {
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

export function LoadingButton({
  isLoading,
  children,
  className = "",
}: LoadingButtonProps) {
  return (
    <Button className={className} disabled={isLoading}>
      {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Button>
  );
}

// Inline Loading Component
export function InlineLoading() {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}
