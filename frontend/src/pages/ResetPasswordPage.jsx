import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import AuthFormCard from '@/components/auth/AuthFormCard';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, isAuthLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [resetSuccess, setResetSuccess] = useState(false);

  const passwordValid = password.length >= 6;
  const confirmValid = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!passwordValid || !confirmValid) {
      setTouched({ password: true, confirmPassword: true });
      return;
    }
    const result = await updatePassword(password);
    if (result.success) {
      setResetSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } else {
      toast.error(result.error || 'Failed to reset password');
    }
  };

  if (resetSuccess) {
    return (
      <AuthFormCard title="Password updated!" subtitle="Redirecting to dashboard...">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Your password has been reset. Redirecting...</p>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard title="Set new password" subtitle="Enter your new password below"
      footerText="Back to" footerLinkText="Sign in" footerLinkTo="/login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="reset-password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="At least 6 characters" autoComplete="new-password"
              className={cn('w-full pl-10 pr-11 py-2.5 rounded-lg bg-secondary border text-foreground text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all',
                touched.password && !passwordValid ? 'border-destructive' : 'border-border')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {touched.password && !passwordValid && <p className="text-xs text-destructive mt-1">Min 6 characters</p>}
        </div>
        <div>
          <label htmlFor="reset-confirm" className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input id="reset-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              placeholder="Repeat password" autoComplete="new-password"
              className={cn('w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border text-foreground text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all',
                touched.confirmPassword && !confirmValid ? 'border-destructive' : 'border-border')} />
          </div>
          {touched.confirmPassword && !confirmValid && <p className="text-xs text-destructive mt-1">Passwords don't match</p>}
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
        <button type="submit" disabled={isAuthLoading}
          className={cn('w-full py-3 rounded-xl font-semibold text-sm gradient-bg text-white',
            'hover:opacity-90 shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2')}>
          {isAuthLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</> : 'Update Password'}
        </button>
      </form>
    </AuthFormCard>
  );
}
