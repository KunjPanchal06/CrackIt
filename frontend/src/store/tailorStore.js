import { create } from 'zustand';
import api from '@/lib/axios';

/**
 * Zustand store for AI Resume Tailoring state.
 *
 * Manages:
 * - Tailoring request/response lifecycle
 * - Original LaTeX for diff comparison
 * - Preview PDF compilation
 * - Saving tailored result (as new or replace original)
 */
const useTailorStore = create((set) => ({
  // ---------- State ----------
  isTailoring: false,
  tailoredLatex: null,
  originalLatex: null,       // For diff comparison
  tailorError: null,
  originalResumeId: null,
  originalTitle: null,

  // Preview compile state
  isCompilingPreview: false,
  previewPdfUrl: null,
  previewError: null,

  // ---------- Actions ----------

  /**
   * Fetch the full resume data (including latex_code) for diff comparison.
   */
  fetchOriginalLatex: async (resumeId) => {
    try {
      const { data } = await api.get(`/resumes/${resumeId}`);
      set({ originalLatex: data.latex_code });
      return data.latex_code;
    } catch {
      return null;
    }
  },

  /**
   * Send a resume + JD to the backend for AI tailoring.
   */
  tailorResume: async (resumeId, jobDescription) => {
    set({
      isTailoring: true,
      tailoredLatex: null,
      tailorError: null,
      previewPdfUrl: null,
      previewError: null,
    });
    try {
      const { data } = await api.post('/tailor/', {
        resume_id: resumeId,
        job_description: jobDescription,
      });

      if (!data.success) {
        set({
          isTailoring: false,
          tailorError: data.error,
          originalResumeId: data.original_resume_id,
          originalTitle: data.original_title,
        });
        return null;
      }

      set({
        isTailoring: false,
        tailoredLatex: data.tailored_latex,
        originalResumeId: data.original_resume_id,
        originalTitle: data.original_title,
      });
      return data.tailored_latex;
    } catch (error) {
      set({
        isTailoring: false,
        tailorError: error.userMessage || 'Failed to tailor resume',
      });
      return null;
    }
  },

  /**
   * Compile tailored LaTeX to PDF for preview (without saving to a resume).
   */
  compilePreview: async (latexCode) => {
    set({ isCompilingPreview: true, previewPdfUrl: null, previewError: null });
    try {
      const { data } = await api.post('/tailor/compile-preview', {
        latex_code: latexCode,
      });

      if (!data.success) {
        set({ isCompilingPreview: false, previewError: data.error });
        return null;
      }

      set({ isCompilingPreview: false, previewPdfUrl: data.pdf_url });
      return data.pdf_url;
    } catch (error) {
      set({
        isCompilingPreview: false,
        previewError: error.userMessage || 'Failed to compile preview',
      });
      return null;
    }
  },

  /**
   * Save the tailored LaTeX as a brand-new resume.
   */
  saveAsNew: async (title, latexCode) => {
    try {
      const { data } = await api.post('/resumes/', {
        title,
        latex_code: latexCode,
      });
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Overwrite the original resume's LaTeX with the tailored version.
   */
  replaceOriginal: async (resumeId, latexCode) => {
    try {
      const { data } = await api.patch(`/resumes/${resumeId}`, {
        latex_code: latexCode,
      });
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Reset all tailoring state (used when leaving the page).
   */
  reset: () =>
    set({
      isTailoring: false,
      tailoredLatex: null,
      originalLatex: null,
      tailorError: null,
      originalResumeId: null,
      originalTitle: null,
      isCompilingPreview: false,
      previewPdfUrl: null,
      previewError: null,
    }),
}));

export default useTailorStore;
