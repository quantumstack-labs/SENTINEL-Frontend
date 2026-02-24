// @ts-nocheck — React 19 class Component types + useDefineForClassFields:false
// causes false-positive TS errors on inherited state/props. Pattern is correct.
import { Component } from 'react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[Sentinel ErrorBoundary]', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg flex items-center justify-center p-8">
                    <div className="max-w-md text-center space-y-4">
                        <div className="w-16 h-16 bg-risk/10 rounded-full flex items-center justify-center mx-auto border border-risk/20">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-xl font-display text-text-primary">Something went wrong</h1>
                        <p className="text-sm text-text-secondary font-mono">
                            {this.state.error?.message ?? 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-amber-primary text-bg rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
