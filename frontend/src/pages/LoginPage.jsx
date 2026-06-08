import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import AuthFormCard from '@/components/auth/AuthFormCard';
import OAuthButton from '@/components/auth/OAuthButton';

/**
 * Login page — email/password sign-in + Google OAuth.
 * Redirects to /dashboard on success.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  // Validation
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!emailValid || !passwordValid) {
      setTouched({ email: true, password: true });
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    await loginWithGoogle();
  };

  return (
    <AuthFormCard
      title="Welcome back"
      subtitle="Sign in to continue tailoring your resumes"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/signup"
    >
      {/* Google OAuth */}
      <OAuthButton
        onClick={handleGoogleLogin}
        isLoading={isAuthLoading}
        label="Sign in with Google"
      />

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          or continue with email
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@example.com"
              autoComplete="email"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg',
                'bg-secondary border text-foreground text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring/50',
                'transition-all duration-200',
                touched.email && !emailValid
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-border'
              )}
            />
          </div>
          {touched.email && !emailValid && (
            <p className="text-xs text-destructive mt-1">Enter a valid email address</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="••••••••"
              autoComplete="current-password"
              className={cn(
                'w-full pl-10 pr-11 py-2.5 rounded-lg',
                'bg-secondary border text-foreground text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring/50',
                'transition-all duration-200',
                touched.password && !passwordValid
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-border'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {touched.password && !passwordValid && (
            <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
          )}
        </div>

        {/* Server Error */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isAuthLoading}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-sm',
            'gradient-bg text-white',
            'hover:opacity-90 transition-all duration-200',
            'shadow-lg shadow-primary/25',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {isAuthLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </AuthFormCard>
  );
}
