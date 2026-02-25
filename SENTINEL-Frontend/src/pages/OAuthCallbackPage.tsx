import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * This page handles the redirect from the backend after Google OAuth.
 * The backend sends the user here with a ?token=<JWT> query param.
 * We save it to localStorage and redirect to the dashboard.
 */
export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            localStorage.setItem('sentinel_token', token);
            // Small delay so AuthContext picks up the new token
            checkAuth();
            navigate('/dashboard', { replace: true });
        } else {
            setError('Authentication failed — no token received from the server.');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
    }, [searchParams, navigate, checkAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-2 p-8 rounded-2xl border border-border-medium shadow-2xl text-center max-w-sm">
                {error ? (
                    <>
                        <p className="text-red-400 mb-2">{error}</p>
                        <p className="text-text-tertiary text-sm">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <Loader2 className="w-8 h-8 animate-spin text-amber-primary mx-auto mb-4" />
                        <p className="text-text-primary font-medium">Signing you in...</p>
                        <p className="text-text-tertiary text-sm mt-1">Please wait while we complete authentication.</p>
                    </>
                )}
            </div>
        </div>
    );
}
