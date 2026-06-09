import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

// Layout
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth/AuthGuard';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import ResumesPage from '@/pages/ResumesPage';
import ResumeEditorPage from '@/pages/ResumeEditorPage';
import TailorPage from '@/pages/TailorPage';

// Auth store
import useAuthStore from '@/store/authStore';
import { supabase } from '@/lib/supabase';

/**
 * Root application component.
 * Sets up routing, auth initialization, and global providers.
 *
 * Route structure:
 * - / → Landing page (public)
 * - /login → Login page (public)
 * - /signup → Signup page (public)
 * - /forgot-password → Password reset request (public)
 * - /reset-password → Set new password (public, via email link)
 * - /auth/callback → OAuth redirect handler (public)
 * - /dashboard → Dashboard (protected)
 * - /resumes/* → Resume vault (protected, Phase 2)
 * - /job-descriptions/* → JD intake (protected, Phase 3)
 * - /tailor/* → AI tailoring (protected, Phase 4)
 * - /ats → ATS scoring (protected, Phase 5)
 * - /applications/* → App tracker (protected, Phase 8)
 */
export default function App() {
  const { initialize, setSession } = useAuthStore();

  useEffect(() => {
    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { setSession(session); }
    );
    return () => subscription.unsubscribe();
  }, [initialize, setSession]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }} />

      <Routes>
        {/* ========== Public Routes ========== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* ========== Protected Routes (inside AppLayout) ========== */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resumes" element={<ResumesPage />} />
          <Route path="/resumes/:resumeId" element={<ResumeEditorPage />} />
          <Route path="/job-descriptions" element={<PlaceholderPage title="Job Descriptions" phase={3} />} />
          <Route path="/tailor" element={<TailorPage />} />
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
        <p className="text-muted-foreground">Coming in Phase {phase}</p>
      </div>
    </div>
  );
}
