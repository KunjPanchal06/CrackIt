import { create } from 'zustand';
import api from '@/lib/axios';

/**
 * Zustand store for resume state management.
 *
 * Manages:
 * - List of user's resumes (lightweight, no latex_code)
 * - Currently active resume (full data including latex_code)
 * - CRUD operations via the FastAPI backend
 * - LaTeX compilation state
 * - Loading and error states
 */
const useResumeStore = create((set, get) => ({
  // ---------- State ----------
  resumes: [],           // List of ResumeListItem (no latex_code)
  activeResume: null,    // Full ResumeResponse (with latex_code) for the editor
  isLoading: false,      // True during list/fetch operations
  isSaving: false,       // True during create/update operations
  isCompiling: false,    // True during LaTeX compilation
  error: null,
  compileError: null,    // LaTeX compilation error message

  // ---------- Actions ----------

  /**
   * Fetch all resumes for the current user.
   */
  fetchResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/resumes/');
      set({ resumes: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.userMessage });
    }
  },

  /**
   * Fetch a single resume by ID (includes latex_code).
   */
  fetchResume: async (resumeId) => {
    set({ isLoading: true, error: null, compileError: null });
    try {
      const { data } = await api.get(`/resumes/${resumeId}`);
      set({ activeResume: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false, error: error.userMessage });
      return null;
    }
  },

  /**
   * Create a new resume.
   * Returns the created resume data (with ID) or null on failure.
   */
  createResume: async (title, latexCode) => {
    set({ isSaving: true, error: null });
    try {
      const { data } = await api.post('/resumes/', {
        title,
        latex_code: latexCode,
      });
      // Prepend to the list
      set((state) => ({
        resumes: [
          { id: data.id, title: data.title, pdf_url: data.pdf_url, created_at: data.created_at, updated_at: data.updated_at },
          ...state.resumes,
        ],
        activeResume: data,
        isSaving: false,
      }));
      return data;
    } catch (error) {
      set({ isSaving: false, error: error.userMessage });
      return null;
    }
  },

  /**
   * Update an existing resume (title and/or latex_code).
   */
  updateResume: async (resumeId, updates) => {
    set({ isSaving: true, error: null });
    try {
      const payload = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.latexCode !== undefined) payload.latex_code = updates.latexCode;

      const { data } = await api.patch(`/resumes/${resumeId}`, payload);

      // Update in the list
      set((state) => ({
        resumes: state.resumes.map((r) =>
          r.id === resumeId
            ? { ...r, title: data.title, pdf_url: data.pdf_url, updated_at: data.updated_at }
            : r
        ),
        activeResume: data,
        isSaving: false,
      }));
      return data;
    } catch (error) {
      set({ isSaving: false, error: error.userMessage });
      return null;
    }
  },

  /**
   * Delete a resume by ID.
   */
  deleteResume: async (resumeId) => {
    set({ error: null });
    try {
      await api.delete(`/resumes/${resumeId}`);
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== resumeId),
        activeResume: state.activeResume?.id === resumeId ? null : state.activeResume,
      }));
      return true;
    } catch (error) {
      set({ error: error.userMessage });
      return false;
    }
  },

  /**
   * Compile the active resume's LaTeX to PDF.
   */
  compileResume: async (resumeId) => {
    set({ isCompiling: true, compileError: null });
    try {
      const { data } = await api.post(`/resumes/${resumeId}/compile`);

      if (!data.success) {
        set({ isCompiling: false, compileError: data.error });
        return null;
      }

      // Update pdf_url in active resume and list
      set((state) => ({
        isCompiling: false,
        activeResume: state.activeResume
          ? { ...state.activeResume, pdf_url: data.pdf_url }
          : null,
        resumes: state.resumes.map((r) =>
          r.id === resumeId ? { ...r, pdf_url: data.pdf_url } : r
        ),
      }));
      return data.pdf_url;
    } catch (error) {
      set({ isCompiling: false, compileError: error.userMessage });
      return null;
    }
  },

  /**
   * Set the active resume (used when navigating to editor).
   */
  setActiveResume: (resume) => set({ activeResume: resume, compileError: null }),

  /**
   * Clear errors.
   */
  clearError: () => set({ error: null, compileError: null }),
}));

export default useResumeStore;
