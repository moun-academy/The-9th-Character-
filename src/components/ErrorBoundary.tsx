import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    // Clear local storage
    localStorage.clear();
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#0a0e1a',
          color: '#f8fafc',
          fontFamily: 'Inter, -apple-system, sans-serif',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', maxWidth: '400px' }}>
            The app encountered an error. This might be due to cached data or a temporary issue.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Clear Cache & Reload
          </button>
          {this.state.error && (
            <details style={{ marginTop: '24px', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#64748b' }}>
                Technical Details
              </summary>
              <pre style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#ef4444',
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
