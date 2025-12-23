import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#fff', background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕 Oops.</h1>
                    <p style={{ color: '#94a3b8', maxWidth: '500px', marginBottom: '2rem' }}>
                        Something went wrong. It might be a connection issue or a temporary glitch.
                    </p>
                    <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: '#ef4444', marginBottom: '2rem', maxWidth: '800px', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
