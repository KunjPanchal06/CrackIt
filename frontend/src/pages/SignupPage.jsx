import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import AuthFormCard from '@/components/auth/AuthFormCard';
import OAuthButton from '@/components/auth/OAuthButton';

/**
 * Signup page — create a new account with name, email, password + Google OAuth.
 * Shows a confirmation message after successful email signup.
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isAuthLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Validation
  const nameValid = fullName.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;
  const confirmValid = password === confirmPassword && confirmPassword.length > 0;

  // Password strength
  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-destructive' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-warning' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-amber-400' };
    return { level: 4, label: 'Strong', color: 'bg-success' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!nameValid || !emailValid || !passwordValid || !confirmValid) {
      setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
      return;
    }

    const result = await signup(email, password, fullName.trim());
    if (result.success) {
      // Check if email confirmation is required
      if (result.data?.user && !result.data.session) {
        setSignupSuccess(true);
        toast.success('Check your email for a confirmation link!');
      } else {
        toast.success('Account created! Welcome to CrackIt!');
        navigate('/dashboard', { replace: true });
      }
    } else {
      toast.error(result.error || 'Signup failed');
    }
  };

  const handleGoogleSignup = async () => {
    clearError();
    await loginWithGoogle();
  };

  // Success state — show email confirmation message
  if (signupSuccess) {
    return (
      <AuthFormCard
        title="Check your email"
        subtitle="We sent you a confirmation link"
        footerText="Already confirmed?"
        footerLinkText="Sign in"
        footerLinkTo="/login"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've sent a confirmation email to{' '}
            <span className="text-foreground font-medium">{email}</span>.
            <br />
            Click the link in the email to activate your account.
          </p>
          <button
            onClick={() => {
              setSignupSuccess(false);
              clearError();
            }}
            className="mt-6 text-sm text-primary hover:underline"
          >
            Use a different email
          </button>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      title="Create your account"
      subtitle="Start tailoring your resumes with AI"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      {/* Google OAuth */}
      <OAuthButton
        onClick={handleGoogleSignup}
        isLoading={isAuthLoading}
        label="Sign up with Google"
      />

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          or sign up with email
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-foreground mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              placeholder="Kunj Panchal"
              autoComplete="name"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg',
                'bg-secondary border text-foreground text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring/50',
                'transition-all duration-200',
                touched.fullName && !nameValid
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-border'
              )}
            />
          </div>
          {touched.fullName && !nameValid && (
            <p className="text-xs text-destructive mt-1">Name must be at least 2 characters</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-email"
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
          <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="At least 6 characters"
              autoComplete="new-password"
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
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1.5 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      i <= strength.level ? strength.color : 'bg-border'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength: <span className="font-medium text-foreground">{strength.label}</span>
              </p>
            </div>
          )}
          {touched.password && !passwordValid && (
            <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-foreground mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg',
                'bg-secondary border text-foreground text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring/50',
                'transition-all duration-200',
                touched.confirmPassword && !confirmValid
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-border'
              )}
            />
          </div>
          {touched.confirmPassword && !confirmValid && (
            <p className="text-xs text-destructive mt-1">Passwords do not match</p>
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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </AuthFormCard>
  );
}
