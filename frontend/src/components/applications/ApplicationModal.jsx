import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUSES = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ApplicationModal({ isOpen, onClose, onSubmit, resumes = [], initialData = null, isSaving }) {
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    company: '', role: '', status: 'saved', applied_date: new Date().toISOString().split('T')[0],
    salary_range: '', job_url: '', notes: '', resume_id: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        company: initialData.company || '',
        role: initialData.role || '',
        status: initialData.status || 'saved',
        applied_date: initialData.applied_date || new Date().toISOString().split('T')[0],
        salary_range: initialData.salary_range || '',
        job_url: initialData.job_url || '',
        notes: initialData.notes || '',
        resume_id: initialData.resume_id || '',
      });
    } else {
      setForm({
        company: '', role: '', status: 'saved',
        applied_date: new Date().toISOString().split('T')[0],
        salary_range: '', job_url: '', notes: '', resume_id: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    // Remove empty optional fields
    Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
    onSubmit(payload);
  };

  if (!isOpen) return null;

  const inputCls = 'w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">{isEditing ? 'Edit Application' : 'Add Application'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Company *</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                required className={inputCls} placeholder="Google" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Role *</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                required className={inputCls} placeholder="Software Engineer" />
            </div>
          </div>

          {/* Status + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={cn(inputCls, 'appearance-none cursor-pointer')}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Applied Date</label>
              <input type="date" value={form.applied_date} onChange={e => setForm(f => ({ ...f, applied_date: e.target.value }))} className={inputCls} />
            </div>
          </div>

          {/* Salary + Job URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Salary Range</label>
              <input value={form.salary_range} onChange={e => setForm(f => ({ ...f, salary_range: e.target.value }))}
                className={inputCls} placeholder="$120k–$150k" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Job URL</label>
              <input value={form.job_url} onChange={e => setForm(f => ({ ...f, job_url: e.target.value }))}
                className={inputCls} placeholder="https://..." />
            </div>
          </div>

          {/* Resume Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Linked Resume</label>
            <select value={form.resume_id} onChange={e => setForm(f => ({ ...f, resume_id: e.target.value }))} className={cn(inputCls, 'appearance-none cursor-pointer')}>
              <option value="">No resume linked</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} className={cn(inputCls, 'resize-none')} placeholder="Referred by John, interview on Friday..." />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving || !form.company || !form.role}
              className="px-5 py-2 rounded-lg text-sm font-semibold gradient-bg text-white hover:opacity-90 disabled:opacity-50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
