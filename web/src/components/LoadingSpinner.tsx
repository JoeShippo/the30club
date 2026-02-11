interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'lg', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <span className={`loading loading-spinner text-primary ${sizeClasses[size]}`} />
      {message && (
        <p className="text-sm opacity-60">{message}</p>
      )}
    </div>
  );
}