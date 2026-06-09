import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiffEditor } from '@monaco-editor/react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Wand2, FileText, Briefcase, Loader2, AlertTriangle,
  SaveAll, Replace, Sparkles, Check, ArrowRight,
  Play, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  GitCompareArrows, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import useResumeStore from '@/store/resumeStore';
import useTailorStore from '@/store/tailorStore';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function TailorPage() {
  const navigate = useNavigate();
  const { resumes, fetchResumes, isLoading: isLoadingResumes } = useResumeStore();
  const {
    isTailoring, tailoredLatex, originalLatex, tailorError,
    originalResumeId, originalTitle,
    isCompilingPreview, previewPdfUrl, previewError,
    tailorResume, fetchOriginalLatex, compilePreview,
    saveAsNew, replaceOriginal, reset,
  } = useTailorStore();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [editedLatex, setEditedLatex] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedAs, setSavedAs] = useState(null);
  const [activeTab, setActiveTab] = useState('changes');

  // Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');

  // PDF preview state
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);

  useEffect(() => { fetchResumes(); return () => reset(); }, [fetchResumes, reset]);

  // Fetch original LaTeX when resume is selected
  useEffect(() => {
    if (selectedResumeId) fetchOriginalLatex(selectedResumeId);
  }, [selectedResumeId, fetchOriginalLatex]);

  useEffect(() => {
    if (tailoredLatex) { setEditedLatex(tailoredLatex); setSavedAs(null); setActiveTab('changes'); }
  }, [tailoredLatex]);

  const handleTailor = async () => {
    if (!selectedResumeId) { toast.error('Please select a resume'); return; }
    if (jobDescription.trim().length < 50) { toast.error('Job description must be at least 50 characters'); return; }
    setSavedAs(null);
    await tailorResume(selectedResumeId, jobDescription);
  };

  const handleCompilePreview = async () => {
    const url = await compilePreview(editedLatex);
    if (url) { setCurrentPage(1); toast.success('Preview compiled!'); }
  };

  const handleSaveAsNew = () => {
    setNewResumeTitle(`${originalTitle} — Tailored`);
    setShowSaveModal(true);
  };

  const confirmSaveAsNew = async () => {
    if (!newResumeTitle.trim()) return;
    
    setShowSaveModal(false);
    setIsSaving(true);
    const data = await saveAsNew(newResumeTitle.trim(), editedLatex);
    setIsSaving(false);
    if (data) {
      setSavedAs('new');
      toast.success('Saved as new resume!', { action: { label: 'Open', onClick: () => navigate(`/resumes/${data.id}`) } });
    } else toast.error('Failed to save');
  };

  const handleReplaceOriginal = async () => {
    setIsSaving(true);
    const data = await replaceOriginal(originalResumeId, editedLatex);
    setIsSaving(false);
    if (data) {
      setSavedAs('replaced');
      toast.success('Original resume updated!', { action: { label: 'Open', onClick: () => navigate(`/resumes/${originalResumeId}`) } });
    } else toast.error('Failed to update');
  };

  // Track edits from DiffEditor
  const handleDiffMount = useCallback((editor) => {
    const modified = editor.getModifiedEditor();
    modified.onDidChangeModelContent(() => setEditedLatex(modified.getValue()));
  }, []);

  const canTailor = selectedResumeId && jobDescription.trim().length >= 50 && !isTailoring;
  const hasResult = tailoredLatex && !isTailoring;

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="gradient-bg p-2.5 rounded-xl shadow-lg shadow-primary/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Resume Tailor</h1>
            <p className="text-xs text-muted-foreground">Select a resume, paste a job description, let AI optimize it</p>
          </div>
        </div>
        <button onClick={handleTailor} disabled={!canTailor} id="tailor-btn"
          className={cn('flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-white',
            'hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none')}>
          {isTailoring ? <><Loader2 className="w-4 h-4 animate-spin" />Tailoring…</> : <><Sparkles className="w-4 h-4" />Tailor Resume</>}
        </button>
      </div>

      {/* Split Pane */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left — Input */}
        <div className="w-[38%] flex flex-col gap-4 min-h-0">
          {/* Resume Selector */}
          <div className="rounded-xl border border-border bg-card p-4 flex-shrink-0">
            <label htmlFor="resume-selector" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <FileText className="w-4 h-4 text-primary" />Select Resume
            </label>
            {isLoadingResumes ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
            ) : resumes.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">No resumes yet. <button onClick={() => navigate('/resumes/new')} className="text-primary hover:underline font-medium">Create one</button></div>
            ) : (
              <div className="relative">
                <select id="resume-selector" value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
                  <option value="">Choose a resume…</option>
                  {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="flex-1 rounded-xl border border-border bg-card p-4 flex flex-col min-h-0">
            <label htmlFor="jd-input" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 flex-shrink-0">
              <Briefcase className="w-4 h-4 text-primary" />Job Description
            </label>
            <textarea id="jd-input" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…&#10;&#10;Include role title, responsibilities, required skills, and qualifications."
              className="flex-1 w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground text-sm resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/40 min-h-0" />
            <div className="flex items-center justify-between mt-2 flex-shrink-0">
              <span className={cn('text-xs', jobDescription.length < 50 ? 'text-muted-foreground' : 'text-success')}>
                {jobDescription.length} chars{jobDescription.length > 0 && jobDescription.length < 50 && <span className="text-muted-foreground/60"> · need {50 - jobDescription.length} more</span>}
              </span>
              {jobDescription.length >= 50 && <span className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" />Ready</span>}
            </div>
          </div>
        </div>

        {/* Right — Result */}
        <div className="flex-1 rounded-xl border border-border bg-card flex flex-col min-h-0 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-1">
              {[
                { id: 'changes', label: 'Changes', icon: GitCompareArrows },
                { id: 'preview', label: 'Preview', icon: Eye },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} disabled={!hasResult}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    activeTab === tab.id && hasResult ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    !hasResult && 'opacity-40 cursor-not-allowed')}>
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              ))}
            </div>
            {hasResult && originalTitle && (
              <span className="text-xs text-muted-foreground">Based on "{originalTitle}"</span>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Loading */}
            {isTailoring && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow"><Wand2 className="w-7 h-7 text-white" /></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-bg animate-ping" />
                </div>
                <p className="text-sm font-medium text-foreground">AI is tailoring your resume…</p>
                <p className="text-xs text-muted-foreground">Analyzing job requirements and optimizing keywords</p>
                <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full gradient-bg" style={{ animation: `pulse 1.4s ease-in-out ${i*0.2}s infinite` }} />)}</div>
              </div>
            )}

            {/* Error */}
            {!isTailoring && tailorError && (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full p-5 rounded-xl border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-destructive" /><h3 className="font-semibold text-destructive text-sm">Tailoring Failed</h3></div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 p-3 rounded-lg max-h-40 overflow-auto">{tailorError}</pre>
                </div>
              </div>
            )}

            {/* Empty */}
            {!isTailoring && !tailorError && !tailoredLatex && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center"><Sparkles className="w-9 h-9 text-muted-foreground/30" /></div>
                <p className="text-sm font-medium text-muted-foreground">No result yet</p>
                <p className="text-xs text-muted-foreground/60 max-w-xs">Select a resume, paste a job description, and click <strong className="text-muted-foreground">Tailor Resume</strong></p>
              </div>
            )}

            {/* Changes Tab — Diff Editor */}
            {hasResult && activeTab === 'changes' && (
              <div className="flex-1 min-h-0">
                <DiffEditor
                  original={originalLatex || ''}
                  modified={editedLatex}
                  language="latex"
                  theme="vs-dark"
                  onMount={handleDiffMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    wordWrap: 'on',
                    renderSideBySide: true,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                    originalEditable: false,
                  }}
                  loading={<div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>}
                />
              </div>
            )}

            {/* Preview Tab — PDF */}
            {hasResult && activeTab === 'preview' && (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Preview toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20 flex-shrink-0">
                  <button onClick={handleCompilePreview} disabled={isCompilingPreview}
                    className={cn('flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold gradient-bg text-white',
                      'hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed')}>
                    {isCompilingPreview ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Compiling…</> : <><Play className="w-3.5 h-3.5" />Compile Preview</>}
                  </button>
                  {previewPdfUrl && numPages && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.1))} className="p-1 rounded hover:bg-accent text-muted-foreground"><ZoomOut className="w-3.5 h-3.5" /></button>
                      <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(pdfScale * 100)}%</span>
                      <button onClick={() => setPdfScale(s => Math.min(2.0, s + 0.1))} className="p-1 rounded hover:bg-accent text-muted-foreground"><ZoomIn className="w-3.5 h-3.5" /></button>
                      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-1 rounded hover:bg-accent text-muted-foreground disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5" /></button>
                        <span className="text-xs text-muted-foreground">{currentPage} / {numPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} className="p-1 rounded hover:bg-accent text-muted-foreground disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF content */}
                <div className="flex-1 overflow-auto flex items-start justify-center p-4 min-h-0">
                  {isCompilingPreview && (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Compiling LaTeX…</p>
                    </div>
                  )}
                  {!isCompilingPreview && previewError && (
                    <div className="max-w-lg w-full p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                      <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-destructive" /><h3 className="font-semibold text-destructive text-sm">Compilation Error</h3></div>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 p-3 rounded-lg max-h-60 overflow-auto">{previewError}</pre>
                    </div>
                  )}
                  {!isCompilingPreview && !previewError && !previewPdfUrl && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center"><FileText className="w-8 h-8 text-muted-foreground/40" /></div>
                      <p className="text-sm text-muted-foreground">Click <strong>Compile Preview</strong> to see the PDF</p>
                    </div>
                  )}
                  {!isCompilingPreview && previewPdfUrl && (
                    <Document file={previewPdfUrl} onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                      loading={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>}
                      error={<div className="text-center p-8"><AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" /><p className="text-sm text-muted-foreground">Failed to load PDF</p></div>}>
                      <Page pageNumber={currentPage} scale={pdfScale} className="shadow-2xl rounded-lg overflow-hidden" renderTextLayer={true} renderAnnotationLayer={true} />
                    </Document>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Save Actions Bar */}
          {hasResult && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 flex-shrink-0">
              <p className="text-xs text-muted-foreground">
                {savedAs === 'new' && '✓ Saved as new resume'}
                {savedAs === 'replaced' && '✓ Original resume updated'}
                {!savedAs && 'Review changes above, then choose how to save'}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={handleSaveAsNew} disabled={isSaving || savedAs === 'new'} id="save-as-new-btn"
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card text-foreground',
                    'hover:bg-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed')}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedAs === 'new' ? <Check className="w-4 h-4 text-success" /> : <SaveAll className="w-4 h-4" />}
                  {savedAs === 'new' ? 'Saved' : 'Save as New'}
                </button>
                <button onClick={handleReplaceOriginal} disabled={isSaving || savedAs === 'replaced'} id="replace-original-btn"
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-white',
                    'hover:opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none')}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedAs === 'replaced' ? <Check className="w-4 h-4" /> : <Replace className="w-4 h-4" />}
                  {savedAs === 'replaced' ? 'Replaced' : 'Replace Original'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal Overlay */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-foreground mb-2">Save as New Resume</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a name for your newly tailored resume.
            </p>
            <input
              type="text"
              value={newResumeTitle}
              onChange={(e) => setNewResumeTitle(e.target.value)}
              placeholder="e.g., Software Engineer - Google"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmSaveAsNew();
                if (e.key === 'Escape') setShowSaveModal(false);
              }}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveAsNew}
                disabled={!newResumeTitle.trim()}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold gradient-bg text-white hover:opacity-90 disabled:opacity-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Save Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
