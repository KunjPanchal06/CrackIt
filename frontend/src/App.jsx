import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

// Layout
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth/AuthGuard';

// Pages
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

// Auth store
import useAuthStore from '@/store/authStore';
import { supabase } from '@/lib/supabase';

/**
 * Root application component.
 * Sets up routing, auth initialization, and global providers.
 * 
 * Route structure:
 * - / → Landing page (public)
 * - /login, /signup → Auth pages (public, built in Phase 1)
 * - /dashboard → Dashboard (protected)
 * - /resumes/* → Resume vault (protected, built in Phase 2)
 * - /job-descriptions/* → JD intake (protected, built in Phase 3)
 * - /tailor/* → AI tailoring (protected, built in Phase 4)
 * - /ats → ATS scoring (protected, built in Phase 5)
 * - /applications/* → App tracker (protected, built in Phase 8)
 */
export default function App() {
  const { initialize, setSession } = useAuthStore();

  useEffect(() => {
    // Check for existing session on mount
    initialize();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [initialize, setSession]);

  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />

      <Routes>
        {/* ========== Public Routes ========== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Login & Signup — placeholder, built in Phase 1 */}
        <Route
          path="/login"
          element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold gradient-text mb-2">Login Page</h2>
                <p className="text-muted-foreground">Coming in Phase 1 — Authentication</p>
              </div>
            </div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold gradient-text mb-2">Signup Page</h2>
                <p className="text-muted-foreground">Coming in Phase 1 — Authentication</p>
              </div>
            </div>
          }
        />

        {/* ========== Protected Routes (inside AppLayout) ========== */}
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Placeholder routes — will be replaced in later phases */}
          <Route path="/resumes" element={<PlaceholderPage title="Resume Vault" phase={2} />} />
          <Route path="/job-descriptions" element={<PlaceholderPage title="Job Descriptions" phase={3} />} />
          <Route path="/tailor" element={<PlaceholderPage title="AI Resume Tailor" phase={4} />} />
          <Route path="/ats" element={<PlaceholderPage title="ATS Score & Analysis" phase={5} />} />
          <Route path="/applications" element={<PlaceholderPage title="Application Tracker" phase={8} />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" phase={10} />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Temporary placeholder component for features not yet built.
 * Shows the feature name and which phase will implement it.
 */
function PlaceholderPage({ title, phase }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center p-10 rounded-2xl border border-dashed border-border">
        <h2 className="text-2xl font-bold gradient-text mb-2">{title}</h2>
        <p className="text-muted-foreground">
          Coming in Phase {phase}
        </p>
      </div>
    </div>
  );
}
