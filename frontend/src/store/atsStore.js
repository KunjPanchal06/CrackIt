import { create } from 'zustand';
import api from '@/lib/axios';

const useAtsStore = create((set) => ({
  isAnalyzing: false,
  analysisResult: null,
  analysisError: null,

  analyzeResume: async (resumeId, jobDescription) => {
    set({ isAnalyzing: true, analysisError: null, analysisResult: null });
    try {
      const response = await api.post('/ats/analyze', {
        resume_id: resumeId,
        job_description: jobDescription,
      });
      set({ analysisResult: response.data, isAnalyzing: false });
      return response.data;
    } catch (error) {
      console.error('ATS analysis failed:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to analyze resume. Please try again.';
      set({ analysisError: errorMsg, isAnalyzing: false });
      return null;
    }
  },

  reset: () => set({ isAnalyzing: false, analysisResult: null, analysisError: null }),
}));

export default useAtsStore;
