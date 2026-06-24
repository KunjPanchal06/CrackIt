import { create } from 'zustand';
import api from '@/lib/axios';

/**
 * Zustand store for Application Tracker state management.
 *
 * Manages:
 * - List of user's job applications
 * - CRUD operations via the FastAPI backend
 * - Status updates (for Kanban drag-and-drop)
 * - Aggregate statistics (total, per-status, response rate)
 * - Loading and error states
 */
const useApplicationStore = create((set, get) => ({
  // ---------- State ----------
  applications: [],
  stats: null,
  isLoading: false,
  isSaving: false,
  error: null,

  // ---------- Actions ----------

  /**
   * Fetch all applications for the current user.
   */
  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/applications/');
      set({ applications: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.userMessage });
      return null;
    }
  },

  /**
   * Fetch aggregate statistics for the stats bar.
   */
  fetchStats: async () => {
    try {
      const { data } = await api.get('/applications/stats');
      set({ stats: data });
      return data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return null;
    }
  },

  /**
   * Create a new application.
   * Returns the created application data or null on failure.
   */
  createApplication: async (applicationData) => {
    set({ isSaving: true, error: null });
    try {
      const { data } = await api.post('/applications/', applicationData);
      set((state) => ({
        applications: [data, ...state.applications],
        isSaving: false,
      }));
      // Refresh stats
      get().fetchStats();
      return data;
    } catch (error) {
      set({ isSaving: false, error: error.userMessage });
      return null;
    }
  },

  /**
   * Update an existing application (partial update).
   */
  updateApplication: async (applicationId, updates) => {
    set({ isSaving: true, error: null });
    try {
      const { data } = await api.patch(`/applications/${applicationId}`, updates);
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === applicationId ? data : a
        ),
        isSaving: false,
      }));
      get().fetchStats();
      return data;
    } catch (error) {
      set({ isSaving: false, error: error.userMessage });
      return null;
    }
  },

  /**
   * Update only the status of an application.
   * Optimistic update for smooth drag-and-drop.
   */
  updateStatus: async (applicationId, newStatus) => {
    // Optimistic update
    const previousApps = get().applications;
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === applicationId ? { ...a, status: newStatus } : a
      ),
    }));

    try {
      const { data } = await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      // Replace with server response
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === applicationId ? data : a
        ),
      }));
      get().fetchStats();
      return data;
    } catch (error) {
      // Rollback on failure
      set({ applications: previousApps });
      console.error('Status update failed:', error);
      return null;
    }
  },

  /**
   * Delete an application by ID.
   */
  deleteApplication: async (applicationId) => {
    set({ error: null });
    try {
      await api.delete(`/applications/${applicationId}`);
      set((state) => ({
        applications: state.applications.filter((a) => a.id !== applicationId),
      }));
      get().fetchStats();
      return true;
    } catch (error) {
      set({ error: error.userMessage });
      return false;
    }
  },

  /**
   * Clear errors.
   */
  clearError: () => set({ error: null }),
}));

export default useApplicationStore;
