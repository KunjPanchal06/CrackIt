import { Link } from 'react-router-dom';
import {
  Wand2,
  FileText,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Landing page — the public-facing homepage for CrackIt.
 * Features a hero section, feature cards, how-it-works steps, and CTA.
 */

const features = [
  {
    icon: Wand2,
    title: 'AI-Powered Tailoring',
    description:
      'Automatically rewrite your resume to match any job description using Llama 3.3 70B.',
  },
  {
    icon: BarChart3,
    title: 'ATS Score Analysis',
    description:
      'Get instant keyword match scores and actionable feedback to beat applicant tracking systems.',
  },
  {
    icon: FileText,
    title: 'LaTeX Resume Vault',
    description:
      'Store and edit multiple resumes with a professional Monaco code editor and live PDF preview.',
  },
  {
    icon: Zap,
    title: 'One-Click Export',
    description:
      'Compile your LaTeX resume to pixel-perfect PDF with Tectonic. Download .tex or .pdf instantly.',
  },
  {
    icon: Shield,
    title: 'Version History',
    description:
      'Every change is tracked. Compare versions side-by-side and revert to any previous state.',
  },
  {
    icon: Sparkles,
    title: 'Application Tracker',
    description:
      'Track where you applied, with which resume, and follow your application pipeline visually.',
  },
];

const steps = [
  { number: '01', title: 'Upload Resume', description: 'Paste your LaTeX resume or start from a template' },
  { number: '02', title: 'Add Job Description', description: 'Paste the JD or upload a PDF/DOCX file' },
  { number: '03', title: 'AI Tailors It', description: 'Llama 3.3 rewrites your resume to match the role' },
  { number: '04', title: 'Export & Apply', description: 'Download the optimized PDF and start applying' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ==================== NAVBAR ==================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="gradient-bg w-8 h-8 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">CrackIt</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={cn(
                'px-5 py-2.5 text-sm font-semibold rounded-lg',
                'gradient-bg text-white',
                'hover:opacity-90 transition-opacity',
                'shadow-lg shadow-primary/25'
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Powered by Llama 3.3 70B
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
            Tailor Your Resume
            <br />
            <span className="gradient-text">With AI Precision</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Paste a job description, let AI rewrite your LaTeX resume to match — optimized
            for ATS scores, keyword injection, and recruiter attention.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/signup"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-3.5 rounded-xl',
                'gradient-bg text-white font-semibold text-base',
                'hover:opacity-90 transition-all duration-200',
                'shadow-xl shadow-primary/30',
                'hover:shadow-2xl hover:shadow-primary/40'
              )}
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/KunjPanchal06/CrackIt"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-3.5 rounded-xl',
                'bg-secondary text-foreground font-semibold text-base',
                'border border-border hover:bg-accent transition-all duration-200'
              )}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Free to use
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Open source
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES GRID ==================== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">land the job</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From resume editing to application tracking — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={cn(
                  'group p-6 rounded-2xl border border-border',
                  'bg-card hover:bg-accent/50',
                  'transition-all duration-300',
                  'hover:shadow-lg hover:shadow-primary/5',
                  'hover:-translate-y-1'
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps to a perfectly tailored resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line (hidden on last item) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-primary/40 to-transparent" />
                )}
                <div className="text-4xl font-extrabold gradient-text mb-3">{step.number}</div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">crack it</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Stop sending generic resumes. Start tailoring with AI and land more interviews.
          </p>
          <Link
            to="/signup"
            className={cn(
              'inline-flex items-center gap-2 px-10 py-4 rounded-xl',
              'gradient-bg text-white font-semibold text-lg',
              'hover:opacity-90 transition-all duration-200',
              'shadow-xl shadow-primary/30',
              'hover:shadow-2xl hover:shadow-primary/40'
            )}
          >
            Get Started — It's Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="gradient-bg w-6 h-6 rounded-md flex items-center justify-center">
              <Wand2 className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">CrackIt</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built by Kunj Panchal · Open Source on{' '}
            <a
              href="https://github.com/KunjPanchal06/CrackIt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
