import { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import AuthFormCard from '@/components/auth/AuthFormCard';

export default function ForgotPasswordPage() {
  const { resetPassword, isAuthLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!emailValid) { setTouched(true); return; }
    const result = await resetPassword(email);
    if (result.success) { setEmailSent(true); toast.success('Reset email sent!'); }
    else toast.error(result.error || 'Failed to send reset email');
  };

  if (emailSent) {
    return (
      <AuthFormCard title="Check your email" subtitle="We sent a password reset link"
        footerText="Remember your password?" footerLinkText="Sign in" footerLinkTo="/login">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reset link sent to <span className="text-foreground font-medium">{email}</span>.
            <br />Click the link to set a new password.
          </p>
          <button onClick={() => { setEmailSent(false); setEmail(''); clearError(); }}
            className="mt-6 text-sm text-primary hover:underline">Try a different email</button>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard title="Forgot password?" subtitle="Enter your email and we'll send a reset link"
      footerText="Remember your password?" footerLinkText="Sign in" footerLinkTo="/login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="forgot-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)}
              placeholder="you@example.com" autoComplete="email" autoFocus
              className={cn('w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border text-foreground text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all',
                touched && !emailValid ? 'border-destructive' : 'border-border')} />
          </div>
          {touched && !emailValid && <p className="text-xs text-destructive mt-1">Enter a valid email</p>}
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
        <button type="submit" disabled={isAuthLoading}
          className={cn('w-full py-3 rounded-xl font-semibold text-sm gradient-bg text-white',
            'hover:opacity-90 shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2')}>
          {isAuthLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : 'Send Reset Link'}
        </button>
        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-2">
          <ArrowLeft className="w-4 h-4" />Back to sign in
        </Link>
      </form>
    </AuthFormCard>
  );
}
