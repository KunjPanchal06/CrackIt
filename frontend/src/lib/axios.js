import axios from 'axios';
import { supabase } from './supabase';

/**
 * Pre-configured Axios instance for API calls to the FastAPI backend.
 * 
 * Features:
 * - Base URL from environment variable (or proxy in dev)
 * - Automatic Supabase JWT injection in Authorization header
 * - Response interceptor for consistent error handling
 * - Request/response logging in development
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// ---------- Request Interceptor ----------
// Attaches the Supabase access token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------- Response Interceptor ----------
// Normalizes error responses so components get consistent error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract a user-friendly error message
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // If 401 Unauthorized, the session may have expired
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Redirecting to login...');
      // The auth store listener will handle redirect
    }

    // Attach the clean message to the error object
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
