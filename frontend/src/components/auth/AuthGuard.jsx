import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * AuthGuard — protects routes that require authentication.
 * If the user is not logged in, redirects to /login.
 * Shows a loading spinner while checking the initial session.
 */
export default function AuthGuard({ children }) {
  const { user, isLoading } = useAuthStore();

  // Still checking session — show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render the protected content
  return children;
}
