import { useState } from 'react';
import { ArrowUpDown, ExternalLink, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusBadge = {
  saved: 'bg-muted/50 text-muted-foreground',
  applied: 'bg-primary/10 text-primary',
  interviewing: 'bg-warning/10 text-warning',
  offer: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function TableView({ applications, onRowClick }) {
  const [sortKey, setSortKey] = useState('updated_at');
  const [sortAsc, setSortAsc] = useState(false);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...applications].sort((a, b) => {
    const va = a[sortKey] || '';
    const vb = b[sortKey] || '';
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const Th = ({ label, field }) => (
    <th className="px-4 py-3 text-left cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
        {label}<ArrowUpDown className={cn('w-3 h-3', sortKey === field ? 'text-primary' : 'text-muted-foreground/30')} />
      </span>
    </th>
  );

  return (
    <div className="flex-1 overflow-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-muted-foreground sticky top-0">
          <tr>
            <Th label="Company" field="company" />
            <Th label="Role" field="role" />
            <Th label="Status" field="status" />
            <Th label="Applied" field="applied_date" />
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Salary</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resume</th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map(app => (
            <tr key={app.id} onClick={() => onRowClick(app)}
              className="hover:bg-accent/20 cursor-pointer transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{app.company}</td>
              <td className="px-4 py-3 text-muted-foreground">{app.role}</td>
              <td className="px-4 py-3">
                <span className={cn('px-2 py-1 rounded-md text-xs font-semibold capitalize', statusBadge[app.status])}>
                  {app.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{app.applied_date || '—'}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{app.salary_range || '—'}</td>
              <td className="px-4 py-3">
                {app.resume_title ? (
                  <span className="flex items-center gap-1 text-xs text-primary/70"><FileText className="w-3 h-3" />{app.resume_title}</span>
                ) : <span className="text-xs text-muted-foreground/40">—</span>}
              </td>
              <td className="px-4 py-3">
                {app.job_url && (
                  <a href={app.job_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="text-muted-foreground hover:text-primary"><ExternalLink className="w-3.5 h-3.5" /></a>
                )}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground/50 text-sm">No applications yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
