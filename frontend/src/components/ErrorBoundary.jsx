import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full glass-panel border border-border rounded-3xl p-8 shadow-2xl text-center">
             <div className="size-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
             </div>
             <h2 className="text-2xl font-display font-bold text-main mb-2">Something went wrong</h2>
             <p className="text-sm text-muted mb-8">An unexpected error occurred. Please refresh the page to try again, or return to the dashboard.</p>
             <div className="flex flex-col gap-3">
               <button 
                 onClick={() => window.location.reload()}
                 className="w-full py-3 bg-primary text-background rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 text-sm"
               >
                 Refresh Page
               </button>
               <a 
                 href="/dashboard"
                 className="w-full py-3 bg-main/5 text-main border border-border rounded-xl font-bold transition-all hover:bg-main/10 text-sm"
               >
                 Return to Dashboard
               </a>
             </div>
             
             {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-8 text-left bg-main/5 p-4 rounded-xl overflow-x-auto text-[10px] font-mono text-danger/80">
                  <p className="font-bold mb-2">{this.state.error.toString()}</p>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
             )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
