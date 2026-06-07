import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

/**
 * Zustand store for authentication state.
 * 
 * Manages:
 * - Current user and session data
 * - Login, signup, logout actions
 * - OAuth (Google) sign-in
 * - Session initialization and persistence
 * - Loading and error states
 */
const useAuthStore = create((set, get) => ({
  // ---------- State ----------
  user: null,
  session: null,
  isLoading: true,     // True while checking initial session
  isAuthLoading: false, // True during login/signup actions
  error: null,

  // ---------- Actions ----------

  /**
   * Initialize auth by checking for an existing session.
   * Called once when the app mounts.
   */
  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Sign up with email and password.
   */
  signup: async (email, password, fullName) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthLoading: false,
      });
      return { success: true, data };
    } catch (error) {
      set({ isAuthLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign in with email and password.
   */
  login: async (email, password) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ isAuthLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign in with Google OAuth via Supabase.
   */
  loginWithGoogle: async () => {
    set({ isAuthLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // User will be redirected — no need to update state here
    } catch (error) {
      set({ isAuthLoading: false, error: error.message });
    }
  },

  /**
   * Sign out the current user.
   */
  logout: async () => {
    set({ isAuthLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        isAuthLoading: false,
      });
    } catch (error) {
      set({ isAuthLoading: false, error: error.message });
    }
  },

  /**
   * Send a password reset email.
   */
  resetPassword: async (email) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      set({ isAuthLoading: false });
      return { success: true };
    } catch (error) {
      set({ isAuthLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Update the user's password (after clicking reset link).
   */
  updatePassword: async (newPassword) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      set({ isAuthLoading: false });
      return { success: true };
    } catch (error) {
      set({ isAuthLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear any stored error.
   */
  clearError: () => set({ error: null }),

  /**
   * Set user and session directly (used by auth listener).
   */
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },
}));

export default useAuthStore;
