import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { supabase } from '@/lib/supabase';

/**
 * AuthCallback page — handles OAuth redirect.
 * After Google OAuth, Supabase redirects here with the session in the URL hash.
 * This page detects the session and redirects to the dashboard.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  const handleCallback = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        setSession(session);
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      navigate('/login', { replace: true });
    }
  }, [navigate, setSession]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-pulse-glow p-8 rounded-2xl">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
