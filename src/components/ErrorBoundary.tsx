import React from "react";
import { Link } from "react-router-dom";

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, State> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for now — could wire to remote logging (Sentry, LogRocket)
    // Keep the logging minimal to avoid exposing secrets.
    console.error("Unhandled error caught by ErrorBoundary:", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-xl p-8 rounded-lg shadow-lg border border-border text-center">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred while rendering the page. You can try reloading or go back to the homepage.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 rounded bg-accent text-accent-foreground">Reload</button>
              <Link to="/" className="px-4 py-2 rounded border border-border">Home</Link>
              <button onClick={this.reset} className="px-4 py-2 rounded border border-border">Dismiss</button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-xs text-muted-foreground text-left break-words">
                <summary>Show error</summary>
                <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
