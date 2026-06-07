import { LayoutDashboard, FileText, Briefcase, Wand2, BarChart3, FolderClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Dashboard page — placeholder for Phase 9.
 * Shows welcome message and quick-action cards linking to main features.
 */

const quickActions = [
  { icon: FileText, label: 'Resumes', description: 'Manage your LaTeX resumes', path: '/resumes', color: 'from-blue-500 to-cyan-500' },
  { icon: Briefcase, label: 'Job Descriptions', description: 'Add job descriptions', path: '/job-descriptions', color: 'from-purple-500 to-pink-500' },
  { icon: Wand2, label: 'AI Tailor', description: 'Tailor resume to a job', path: '/tailor', color: 'from-amber-500 to-orange-500' },
  { icon: BarChart3, label: 'ATS Score', description: 'Check ATS compatibility', path: '/ats', color: 'from-green-500 to-emerald-500' },
  { icon: FolderClock, label: 'Applications', description: 'Track your applications', path: '/applications', color: 'from-rose-500 to-red-500' },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your resume tailoring workspace.
        </p>
      </div>

      {/* Stats Cards — placeholder, will be populated in Phase 9 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Resumes', value: '—', subtext: 'Create your first resume' },
          { label: 'Applications', value: '—', subtext: 'Start tracking' },
          { label: 'Avg ATS Score', value: '—', subtext: 'Score a resume' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
          >
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={cn(
              'group p-5 rounded-xl border border-border bg-card',
              'hover:bg-accent/30 transition-all duration-200',
              'hover:-translate-y-0.5 hover:shadow-md'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
              'bg-gradient-to-br', action.color
            )}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground">{action.label}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
