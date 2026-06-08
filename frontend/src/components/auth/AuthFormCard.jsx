import { Link } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AuthFormCard — shared wrapper for all authentication pages.
 * Provides:
 * - Animated floating gradient background orbs
 * - Glassmorphic centered card
 * - CrackIt logo + title + subtitle
 * - Footer link (e.g., "Already have an account? Sign in")
 */
export default function AuthFormCard({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
      {/* ===== Animated Background Orbs ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, oklch(0.72 0.19 265), transparent 70%)',
            top: '-10%',
            left: '-10%',
            animation: 'float-orb-1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, oklch(0.68 0.22 300), transparent 70%)',
            bottom: '-5%',
            right: '-5%',
            animation: 'float-orb-2 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-10"
          style={{
            background: 'radial-gradient(circle, oklch(0.65 0.2 145), transparent 70%)',
            top: '50%',
            left: '60%',
            animation: 'float-orb-3 10s ease-in-out infinite',
          }}
        />
      </div>

      {/* ===== Card ===== */}
      <div
        className={cn(
          'relative z-10 w-full max-w-[440px]',
          'animate-scale-in'
        )}
      >
        {/* Logo + Heading */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="gradient-bg w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CrackIt</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
          )}
        </div>

        {/* Form Card */}
        <div
          className={cn(
            'p-8 rounded-2xl',
            'bg-card/80 backdrop-blur-xl',
            'border border-border',
            'shadow-2xl shadow-black/20'
          )}
        >
          {children}
        </div>

        {/* Footer Link */}
        {footerText && footerLinkText && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            {footerText}{' '}
            <Link
              to={footerLinkTo}
              className="text-primary font-medium hover:underline"
            >
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
