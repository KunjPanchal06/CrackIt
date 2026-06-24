import { create } from 'zustand';
import api from '@/lib/axios';

/**
 * Zustand store for Dashboard state management.
 *
 * Fetches aggregated data from /api/v1/dashboard/summary:
 * - Stats cards (resume count, application count, avg ATS score, response rate)
 * - Application pipeline breakdown
 * - Recent activity (applications + resumes)
 */
const useDashboardStore = create((set) => ({
  // ---------- State ----------
  summary: null,
  isLoading: false,
  error: null,

  // ---------- Actions ----------

  /**
   * Fetch the full dashboard summary from the backend.
   */
  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/dashboard/summary');
      set({ summary: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.userMessage });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDashboardStore;
