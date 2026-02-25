import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => !!localStorage.getItem('sentinel_token')
    );
    const navigate = useNavigate();

    const checkAuth = useCallback(() => {
        setIsAuthenticated(!!localStorage.getItem('sentinel_token'));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        // We use <any> here so TypeScript doesn't complain about snake_case vs camelCase
        const data = await api.postNoAuth<any>(
            '/auth/login',
            { email, password }
        );

        // Smart grab: Check for BOTH snake_case and camelCase
        const validToken = data.access_token || data.accessToken;

        if (!validToken) {
            console.error("Login failed: Could not find token in response data", data);
            return;
        }

        // Save the actual token string!
        localStorage.setItem('sentinel_token', validToken);
        setIsAuthenticated(true);
        navigate('/dashboard');
    }, [navigate]);


    const logout = useCallback(() => {
        localStorage.removeItem('sentinel_token');
        setIsAuthenticated(false);
        navigate('/login');
    }, [navigate]);

    // Listen for 401 session-expired events dispatched by api.ts.
    // Using logout() here means React Router handles navigation — no page
    // reload, so React Query doesn't remount and re-fire all queries.
    useEffect(() => {
        const handleExpired = () => logout();
        window.addEventListener('sentinel-session-expired', handleExpired);
        return () => window.removeEventListener('sentinel-session-expired', handleExpired);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
