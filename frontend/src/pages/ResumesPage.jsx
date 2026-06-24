import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Pencil,
  Clock,
  FileCheck,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import useResumeStore from '@/store/resumeStore';

/**
 * ResumesPage — displays a grid of the user's resumes.
 *
 * Features:
 * - Card grid with resume title, creation date, and PDF status
 * - Create new resume button → navigates to editor with template
 * - Click card → opens editor with that resume
 * - Delete resume with confirmation
 */
export default function ResumesPage() {
  const navigate = useNavigate();
  const {
    resumes,
    isLoading,
    error,
    fetchResumes,
    deleteResume,
    clearError,
  } = useResumeStore();

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchResumes();
    return () => clearError();
  }, [fetchResumes, clearError]);

  const handleDelete = async (e, resumeId, title) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;

    setDeletingId(resumeId);
    const success = await deleteResume(resumeId);
    setDeletingId(null);

    if (success) {
      toast.success('Resume deleted');
    } else {
      toast.error('Failed to delete resume');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Resume Vault
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your LaTeX resumes. Click to edit, compile, and preview.
          </p>
        </div>
        <button
          onClick={() => navigate('/resumes/new')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl',
            'gradient-bg text-white font-semibold text-sm',
            'hover:opacity-90 transition-all duration-200',
            'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25',
            'active:translate-y-0'
          )}
          id="create-resume-btn"
        >
          <Plus className="w-4 h-4" />
          New Resume
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading your resumes...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && resumes.length === 0 && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center p-10 rounded-2xl border border-dashed border-border max-w-md">
            <div className="gradient-bg w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No resumes yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first resume with our LaTeX editor and professional template.
            </p>
            <button
              onClick={() => navigate('/resumes/new')}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'gradient-bg text-white font-semibold',
                'hover:opacity-90 transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25'
              )}
            >
              <Plus className="w-5 h-5" />
              Create Your First Resume
            </button>
          </div>
        </div>
      )}

      {/* Resume Grid */}
      {!isLoading && resumes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              to={`/resumes/${resume.id}`}
              className={cn(
                'group relative p-5 rounded-xl border border-border bg-card',
                'hover:bg-accent/30 transition-all duration-200',
                'hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10',
                'hover:border-primary/30',
                deletingId === resume.id && 'opacity-50 pointer-events-none'
              )}
              id={`resume-card-${resume.id}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  'bg-gradient-to-br from-blue-500 to-cyan-500'
                )}>
                  <FileText className="w-5 h-5 text-white" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Download Button (only if PDF exists) */}
                  {resume.pdf_url && (
                    <a
                      href={resume.pdf_url}
                      download={`${resume.title.replace(/[^a-zA-Z0-9 _-]/g, '')}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
                        'hover:bg-success/10 text-muted-foreground hover:text-success',
                        'transition-all duration-200'
                      )}
                      title="Download PDF"
                      id={`download-resume-${resume.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, resume.id, resume.title)}
                    className={cn(
                      'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
                      'hover:bg-destructive/10 text-muted-foreground hover:text-destructive',
                      'transition-all duration-200'
                    )}
                    title="Delete resume"
                    id={`delete-resume-${resume.id}`}
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-foreground mb-1 truncate">
                {resume.title}
              </h3>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(resume.updated_at)}
                </span>
                {resume.pdf_url ? (
                  <span className="flex items-center gap-1 text-success">
                    <FileCheck className="w-3 h-3" />
                    PDF
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-warning">
                    <Pencil className="w-3 h-3" />
                    Draft
                  </span>
                )}
              </div>

              {/* Hover edit indicator */}
              <div className={cn(
                'absolute bottom-3 right-3 flex items-center gap-1',
                'text-xs text-primary font-medium',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              )}>
                <Pencil className="w-3 h-3" />
                Edit
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
