import { TrendingUp, Briefcase, Send, PhoneCall, Trophy, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'Total', value: stats.total, icon: Briefcase, color: 'text-foreground', bg: 'bg-muted/30' },
    { label: 'Saved', value: stats.saved, icon: Briefcase, color: 'text-muted-foreground', bg: 'bg-muted/20' },
    { label: 'Applied', value: stats.applied, icon: Send, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Interviewing', value: stats.interviewing, icon: PhoneCall, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Offers', value: stats.offer, icon: Trophy, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Response', value: `${stats.response_rate}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(item => (
        <div key={item.label} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border border-border', item.bg)}>
          <item.icon className={cn('w-3.5 h-3.5', item.color)} />
          <span className="text-[11px] text-muted-foreground">{item.label}</span>
          <span className={cn('text-sm font-bold', item.color)}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
