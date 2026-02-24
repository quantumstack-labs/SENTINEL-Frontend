import { type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AlertsPage from './pages/AlertsPage';
import MembersPage from './pages/MembersPage';
import SignupPage from './pages/SignupPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <DashboardProvider>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/auth/callback" element={<OAuthCallbackPage />} />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                />
                <Route
                  path="/dashboard/integrations"
                  element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>}
                />
                <Route
                  path="/dashboard/alerts"
                  element={<ProtectedRoute><AlertsPage /></ProtectedRoute>}
                />
                <Route
                  path="/dashboard/members"
                  element={<ProtectedRoute><MembersPage /></ProtectedRoute>}
                />
                <Route
                  path="/settings"
                  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
                />
              </Routes>
            </Layout>
          </AuthProvider>
        </DashboardProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
