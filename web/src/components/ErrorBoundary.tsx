import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔴 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    });

    // Optional: Send to error tracking service
    // trackError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-6">
            
            {/* Error icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-error" />
              </div>
            </div>

            {/* Error message */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-base-content/60">
                We're sorry, but something unexpected happened. 
                This has been logged and we'll look into it.
              </p>
            </div>

            {/* Error details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="card bg-base-200 text-xs">
                <div className="card-body">
                  <div className="font-mono text-error">
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer opacity-60 hover:opacity-100">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs opacity-60 overflow-auto max-h-40">
                        {this.state.errorInfo}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="btn btn-primary w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn btn-ghost w-full gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Help text */}
            <div className="text-center text-sm opacity-50">
              If this keeps happening, try clearing your browser cache
              or contact support.
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}