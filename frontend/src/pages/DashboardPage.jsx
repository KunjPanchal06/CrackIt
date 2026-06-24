import { useEffect } from 'react';
import {
  LayoutDashboard, FileText, Briefcase, Wand2, BarChart3,
  FolderClock, Loader2, TrendingUp, Clock, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import useDashboardStore from '@/store/dashboardStore';

/**
 * Dashboard page — shows live stats, application pipeline,
 * recent activity, and quick-action cards.
 */

const STATUS_CONFIG = {
  saved:        { label: 'Saved',        color: 'bg-muted-foreground/60',    textColor: 'text-muted-foreground' },
  applied:      { label: 'Applied',      color: 'bg-primary',               textColor: 'text-primary' },
  interviewing: { label: 'Interviewing', color: 'bg-warning',               textColor: 'text-warning' },
  offer:        { label: 'Offer',        color: 'bg-success',               textColor: 'text-success' },
  rejected:     { label: 'Rejected',     color: 'bg-destructive',           textColor: 'text-destructive' },
};

const quickActions = [
  { icon: FileText,    label: 'Resumes',      description: 'Manage your LaTeX resumes', path: '/resumes',      color: 'from-blue-500 to-cyan-500' },
  { icon: Wand2,       label: 'AI Tailor',     description: 'Tailor resume to a job',    path: '/tailor',       color: 'from-amber-500 to-orange-500' },
  { icon: BarChart3,   label: 'ATS Score',     description: 'Check ATS compatibility',   path: '/ats',          color: 'from-green-500 to-emerald-500' },
  { icon: FolderClock, label: 'Applications',  description: 'Track your applications',   path: '/applications', color: 'from-rose-500 to-red-500' },
];

function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const { summary, isLoading, fetchSummary } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const stats = [
    {
      label: 'Total Resumes',
      value: summary?.resume_count ?? '—',
      subtext: summary?.resume_count ? `${summary.resume_count} in vault` : 'Create your first resume',
      icon: FileText,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Applications',
      value: summary?.application_count ?? '—',
      subtext: summary?.application_count ? `${summary.application_count} tracked` : 'Start tracking',
      icon: Briefcase,
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
    },
    {
      label: 'Avg ATS Score',
      value: summary?.avg_ats_score != null ? `${summary.avg_ats_score}%` : '—',
      subtext: summary?.avg_ats_score != null ? 'Across tailored resumes' : 'Score a resume',
      icon: BarChart3,
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-400',
    },
    {
      label: 'Response Rate',
      value: summary?.response_rate != null ? `${summary.response_rate}%` : '—',
      subtext: summary?.response_rate > 0 ? 'Interviews + offers' : 'Apply to get started',
      icon: TrendingUp,
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  // Pipeline data
  const pipeline = summary?.applications_by_status || {};
  const pipelineTotal = Object.values(pipeline).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="gradient-bg p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's an overview of your resume tailoring workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !summary && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading dashboard...</p>
          </div>
        </div>
      )}

      {/* Content — render even while refreshing (summary exists) */}
      {(!isLoading || summary) && (
        <>
          {/* ========== Stats Cards ========== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  'relative p-5 rounded-xl border border-border bg-card overflow-hidden',
                  'hover:border-primary/30 transition-all duration-300 group',
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Background gradient accent */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  stat.gradient,
                )} />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                  </div>
                  <div className={cn(
                    'p-2 rounded-lg bg-muted/50 group-hover:bg-muted/70 transition-colors',
                  )}>
                    <stat.icon className={cn('w-5 h-5', stat.iconColor)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ========== Application Pipeline ========== */}
          {pipelineTotal > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Application Pipeline
                </h2>
                <Link
                  to="/applications"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Pipeline bar */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex rounded-full overflow-hidden h-3 bg-muted/50 mb-4">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = pipeline[status] || 0;
                    if (count === 0) return null;
                    const pct = (count / pipelineTotal) * 100;
                    return (
                      <div
                        key={status}
                        className={cn('transition-all duration-500', config.color)}
                        style={{ width: `${pct}%` }}
                        title={`${config.label}: ${count}`}
                      />
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = pipeline[status] || 0;
                    return (
                      <div key={status} className="flex items-center gap-2">
                        <div className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
                        <span className="text-xs text-muted-foreground">
                          {config.label}
                        </span>
                        <span className={cn('text-xs font-semibold', config.textColor)}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========== Recent Activity + Quick Actions ========== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity (2/3 width) */}
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Recent Activity
              </h2>

              <div className="rounded-xl border border-border bg-card divide-y divide-border">
                {/* Recent Applications */}
                {(summary?.recent_applications?.length > 0 || summary?.recent_resumes?.length > 0) ? (
                  <>
                    {summary.recent_applications.map((app) => (
                      <Link
                        key={`app-${app.id}`}
                        to="/applications"
                        className="flex items-center gap-4 p-4 hover:bg-accent/20 transition-colors"
                      >
                        <div className={cn(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          STATUS_CONFIG[app.status]?.color || 'bg-muted-foreground',
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {app.company} — {app.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className={cn(
                              'capitalize',
                              STATUS_CONFIG[app.status]?.textColor,
                            )}>
                              {app.status}
                            </span>
                            {app.applied_date && ` · Applied ${app.applied_date}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground/60 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(app.updated_at)}
                        </div>
                      </Link>
                    ))}

                    {summary.recent_resumes.map((resume) => (
                      <Link
                        key={`res-${resume.id}`}
                        to={`/resumes/${resume.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-accent/20 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {resume.title}
                          </p>
                          <p className="text-xs text-muted-foreground">Resume updated</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground/60 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(resume.updated_at)}
                        </div>
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Create a resume or add an application to get started
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (1/3 width) */}
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.path}
                    to={action.path}
                    className={cn(
                      'group flex items-center gap-4 p-4 rounded-xl border border-border bg-card',
                      'hover:bg-accent/20 transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20',
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      'bg-gradient-to-br', action.color,
                    )}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{action.label}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
