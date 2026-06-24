import { useEffect, useState } from 'react';
import { FolderClock, Plus, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import useApplicationStore from '@/store/applicationStore';
import useResumeStore from '@/store/resumeStore';
import TableView from '@/components/applications/TableView';
import StatsBar from '@/components/applications/StatsBar';
import ApplicationModal from '@/components/applications/ApplicationModal';

export default function ApplicationsPage() {
  const {
    applications, stats, isLoading, isSaving,
    fetchApplications, fetchStats, createApplication,
    updateApplication, updateStatus, deleteApplication, clearError,
  } = useApplicationStore();
  const { resumes, fetchResumes } = useResumeStore();

  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchStats();
    fetchResumes();
    return () => clearError();
  }, [fetchApplications, fetchStats, fetchResumes, clearError]);

  const handleCardClick = (app) => {
    setEditingApp(app);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingApp(null);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    if (editingApp) {
      const result = await updateApplication(editingApp.id, formData);
      if (result) { toast.success('Application updated'); setShowModal(false); setEditingApp(null); }
      else toast.error('Failed to update');
    } else {
      const result = await createApplication(formData);
      if (result) { toast.success('Application added!'); setShowModal(false); }
      else toast.error('Failed to create');
    }
  };

  const handleDelete = async () => {
    if (!editingApp) return;
    if (!window.confirm(`Delete "${editingApp.company} — ${editingApp.role}"?`)) return;
    const ok = await deleteApplication(editingApp.id);
    if (ok) { toast.success('Deleted'); setShowModal(false); setEditingApp(null); }
    else toast.error('Failed to delete');
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="gradient-bg p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <FolderClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Application Tracker</h1>
            <p className="text-xs text-muted-foreground">Track your job applications from saved to offer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Add Button */}
          <button onClick={handleAddNew} id="add-application-btn"
            className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white',
              'hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25')}>
            <Plus className="w-4 h-4" />Add Application
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-4 flex-shrink-0">
        <StatsBar stats={stats} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading applications...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && applications.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-10 rounded-2xl border border-dashed border-border max-w-md">
            <div className="gradient-bg w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderClock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No applications yet</h2>
            <p className="text-muted-foreground mb-6 text-sm">Start tracking your job applications. Add your first one!</p>
            <button onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">
              <Plus className="w-5 h-5" />Add Your First Application
            </button>
          </div>
        </div>
      )}

      {/* Table View */}
      {!isLoading && applications.length > 0 && (
        <TableView applications={applications} onRowClick={handleCardClick} />
      )}

      {/* Modal */}
      <ApplicationModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingApp(null); }}
        onSubmit={handleSubmit}
        resumes={resumes}
        initialData={editingApp}
        isSaving={isSaving}
      />

      {/* Delete button inside modal (rendered as portal-like element) */}
      {showModal && editingApp && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-slide-up">
          <button onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all">
            <Trash2 className="w-3.5 h-3.5" />Delete Application
          </button>
        </div>
      )}
    </div>
  );
}
