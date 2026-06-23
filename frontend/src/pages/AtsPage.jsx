import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, FileText, Briefcase, Loader2, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, Target, Lightbulb, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import useResumeStore from '@/store/resumeStore';
import useAtsStore from '@/store/atsStore';

export default function AtsPage() {
  const navigate = useNavigate();
  const { resumes, fetchResumes, isLoading: isLoadingResumes } = useResumeStore();
  const {
    isAnalyzing, analysisResult, analysisError,
    analyzeResume, reset
  } = useAtsStore();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    fetchResumes();
    return () => reset();
  }, [fetchResumes, reset]);

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }
    if (jobDescription.trim().length < 50) {
      toast.error('Job description must be at least 50 characters');
      return;
    }
    await analyzeResume(selectedResumeId, jobDescription);
  };

  const canAnalyze = selectedResumeId && jobDescription.trim().length >= 50 && !isAnalyzing;

  // Score Color Logic
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="gradient-bg p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ATS Score & Analysis</h1>
            <p className="text-xs text-muted-foreground">See how well your resume matches a job description</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white',
            'hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none'
          )}
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</>
          ) : (
            <><Target className="w-4 h-4" />Analyze Resume</>
          )}
        </button>
      </div>

      {/* Split Pane */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left — Input */}
        <div className="w-[38%] flex flex-col gap-4 min-h-0">
          {/* Resume Selector */}
          <div className="rounded-xl border border-border bg-card p-4 flex-shrink-0 shadow-sm">
            <label htmlFor="resume-selector" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <FileText className="w-4 h-4 text-primary" />Select Resume
            </label>
            {isLoadingResumes ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />Loading…
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">
                No resumes yet.{' '}
                <button onClick={() => navigate('/resumes/new')} className="text-primary hover:underline font-medium">
                  Create one
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="resume-selector"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                >
                  <option value="">Choose a resume…</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="flex-1 rounded-xl border border-border bg-card p-4 flex flex-col min-h-0 shadow-sm">
            <label htmlFor="jd-input" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 flex-shrink-0">
              <Briefcase className="w-4 h-4 text-primary" />Job Description
            </label>
            <textarea
              id="jd-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…&#10;&#10;Include role title, responsibilities, required skills, and qualifications."
              className="flex-1 w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40 min-h-0"
            />
          </div>
        </div>

        {/* Right — Result Dashboard */}
        <div className="flex-1 rounded-xl border border-border bg-card flex flex-col min-h-0 overflow-hidden shadow-sm relative">
          
          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-bg animate-ping" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Analyzing Match</h2>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Our AI is simulating an ATS system, extracting keywords, and scoring your resume against the job description...
              </p>
            </div>
          )}

          {/* Error State */}
          {!isAnalyzing && analysisError && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Analysis Failed</h2>
              <p className="text-sm text-muted-foreground max-w-md bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
                {analysisError}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isAnalyzing && !analysisResult && !analysisError && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 border border-border/50">
                <Target className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Ready to Analyze</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select your resume and paste the job description you want to apply for. We'll give you an actionable ATS score.
              </p>
            </div>
          )}

          {/* Results Dashboard */}
          {!isAnalyzing && analysisResult && (
            <div className="flex-1 overflow-y-auto p-6 animate-slide-up">
              
              {/* Top Section: Score & Summary */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Circular Score */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-background/50 min-w-[200px]">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                      <circle
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * analysisResult.score) / 100}
                        className={cn("transition-all duration-1000 ease-out", getScoreColor(analysisResult.score))}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={cn("text-4xl font-bold tracking-tighter", getScoreColor(analysisResult.score))}>
                        {analysisResult.score}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">/ 100</span>
                    </div>
                  </div>
                  <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border", getScoreBg(analysisResult.score), getScoreColor(analysisResult.score))}>
                    {analysisResult.score >= 80 ? 'Excellent Match' : analysisResult.score >= 60 ? 'Good Match' : 'Needs Work'}
                  </div>
                </div>

                {/* Match Analysis Paragraph */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Executive Summary
                  </h3>
                  <p className="text-foreground text-sm leading-relaxed bg-primary/5 border border-primary/10 p-5 rounded-2xl">
                    {analysisResult.match_analysis}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Missing Keywords Section */}
                <div className="rounded-2xl border border-border bg-background/50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-muted/20">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <h3 className="font-semibold text-foreground">Missing Keywords</h3>
                    <span className="ml-auto text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                      {analysisResult.missing_keywords.length} missing
                    </span>
                  </div>
                  <div className="p-5">
                    {analysisResult.missing_keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missing_keywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive/50" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-success flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Great job! You've hit all the major keywords.
                      </p>
                    )}
                  </div>
                </div>

                {/* Improvement Suggestions Section */}
                <div className="rounded-2xl border border-border bg-background/50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-muted/20">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold text-foreground">Actionable Suggestions</h3>
                  </div>
                  <div className="p-5">
                    {analysisResult.improvement_suggestions.length > 0 ? (
                      <ul className="space-y-3">
                        {analysisResult.improvement_suggestions.map((suggestion, i) => (
                          <li key={i} className="flex gap-3 text-sm text-foreground items-start bg-background p-3 rounded-xl border border-border/50">
                            <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </div>
                            <span className="leading-relaxed">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-success">No major improvements suggested.</p>
                    )}
                  </div>
                </div>

              </div>
              
              {/* Bottom Action */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => navigate('/tailor')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-white hover:opacity-90 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  Fix with AI Tailor
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
