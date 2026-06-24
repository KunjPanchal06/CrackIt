import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Save,
  Play,
  Loader2,
  ArrowLeft,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Pencil,
  Check,
  X,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import useResumeStore from '@/store/resumeStore';
import { DEFAULT_LATEX_TEMPLATE } from '@/lib/latexTemplate';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * ResumeEditorPage — split-pane LaTeX editor + PDF preview.
 *
 * Left pane: Monaco editor with LaTeX syntax highlighting
 * Right pane: Compiled PDF preview (shown after compilation)
 *
 * Modes:
 * - /resumes/new → Create mode (pre-filled with template)
 * - /resumes/:id → Edit mode (loads existing resume)
 */
export default function ResumeEditorPage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const isNewResume = resumeId === 'new';

  const {
    activeResume,
    isLoading,
    isSaving,
    isCompiling,
    compileError,
    fetchResume,
    createResume,
    updateResume,
    compileResume,
    setActiveResume,
    clearError,
  } = useResumeStore();

  // Local editor state (not synced to store until save)
  const [latexCode, setLatexCode] = useState('');
  const [title, setTitle] = useState('Untitled Resume');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(null);

  // PDF preview state
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const pdfContainerRef = useRef(null);

  // Divider drag state
  const [splitPercent, setSplitPercent] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  // Load resume data
  useEffect(() => {
    if (isNewResume) {
      setLatexCode(DEFAULT_LATEX_TEMPLATE);
      setTitle('Untitled Resume');
      setCurrentResumeId(null);
      setActiveResume(null);
    } else {
      fetchResume(resumeId).then((data) => {
        if (data) {
          setLatexCode(data.latex_code);
          setTitle(data.title);
          setCurrentResumeId(data.id);
        }
      });
    }

    return () => clearError();
  }, [resumeId, isNewResume, fetchResume, setActiveResume, clearError]);

  // Track unsaved changes
  useEffect(() => {
    if (isNewResume) {
      setHasUnsavedChanges(latexCode !== DEFAULT_LATEX_TEMPLATE || title !== 'Untitled Resume');
    } else if (activeResume) {
      setHasUnsavedChanges(
        latexCode !== activeResume.latex_code || title !== activeResume.title
      );
    }
  }, [latexCode, title, activeResume, isNewResume]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ---------- Handlers ----------

  const handleSave = useCallback(async () => {
    if (isNewResume || !currentResumeId) {
      // Create new resume
      const data = await createResume(title, latexCode);
      if (data) {
        setCurrentResumeId(data.id);
        toast.success('Resume created!');
        navigate(`/resumes/${data.id}`, { replace: true });
      }
    } else {
      // Update existing resume
      const data = await updateResume(currentResumeId, {
        title,
        latexCode,
      });
      if (data) {
        toast.success('Resume saved!');
      }
    }
  }, [isNewResume, currentResumeId, title, latexCode, createResume, updateResume, navigate]);

  const handleCompile = useCallback(async () => {
    // Save first if needed
    let idToCompile = currentResumeId;

    if (!idToCompile) {
      const data = await createResume(title, latexCode);
      if (!data) return;
      idToCompile = data.id;
      setCurrentResumeId(data.id);
      navigate(`/resumes/${data.id}`, { replace: true });
    } else if (hasUnsavedChanges) {
      const data = await updateResume(idToCompile, { title, latexCode });
      if (!data) return;
    }

    const pdfUrl = await compileResume(idToCompile);
    if (pdfUrl) {
      toast.success('PDF compiled successfully!');
      setCurrentPage(1);
    }
  }, [currentResumeId, title, latexCode, hasUnsavedChanges, createResume, updateResume, compileResume, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleCompile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleCompile]);

  // Title editing
  const startEditingTitle = () => {
    setTitleInput(title);
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    if (titleInput.trim()) {
      setTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const cancelEditTitle = () => {
    setIsEditingTitle(false);
  };

  // PDF handlers
  const onDocumentLoadSuccess = ({ numPages: total }) => {
    setNumPages(total);
  };

  // Divider drag handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(Math.max(percent, 25), 75));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const pdfUrl = activeResume?.pdf_url;

  // ---------- Render ----------

  if (isLoading && !isNewResume) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-7rem)]">
      {/* ---------- Toolbar ---------- */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        {/* Left — Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/resumes')}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Back to resumes"
            id="back-to-resumes"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') cancelEditTitle();
                }}
                className="px-3 py-1.5 text-lg font-bold bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
                id="title-input"
              />
              <button onClick={saveTitle} className="p-1.5 rounded-lg hover:bg-accent text-success">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={cancelEditTitle} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditingTitle}
              className="flex items-center gap-2 group min-w-0"
              title="Click to rename"
              id="resume-title"
            >
              <h1 className="text-lg font-bold text-foreground truncate">
                {title}
              </h1>
              <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}

          {hasUnsavedChanges && (
            <span className="text-xs text-warning font-medium px-2 py-0.5 rounded-full bg-warning/10 flex-shrink-0">
              Unsaved
            </span>
          )}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
              'border border-border bg-card text-foreground',
              'hover:bg-accent transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Save (Ctrl+S)"
            id="save-resume-btn"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>

          <button
            onClick={handleCompile}
            disabled={isCompiling || isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold',
              'gradient-bg text-white',
              'hover:opacity-90 transition-all duration-200',
              'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none'
            )}
            title="Compile PDF (Ctrl+B)"
            id="compile-resume-btn"
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Compile PDF
              </>
            )}
          </button>

          {/* Download PDF — visible only after compilation */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${title.replace(/[^a-zA-Z0-9 _-]/g, '')}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                'border border-success/30 bg-success/10 text-success',
                'hover:bg-success/20 transition-all duration-200',
              )}
              title="Download PDF"
              id="download-pdf-btn"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>
      </div>

      {/* ---------- Split Pane ---------- */}
      <div
        ref={containerRef}
        className="flex flex-1 rounded-xl border border-border overflow-hidden bg-card min-h-0"
      >
        {/* Left Pane — Monaco Editor */}
        <div
          className="flex flex-col min-h-0"
          style={{ width: `${splitPercent}%` }}
        >
          {/* Editor Header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">LaTeX Editor</span>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="latex"
              theme="vs-dark"
              value={latexCode}
              onChange={(value) => setLatexCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                renderLineHighlight: 'gutter',
                tabSize: 2,
                suggestOnTriggerCharacters: true,
                quickSuggestions: false,
              }}
              loading={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              }
            />
          </div>
        </div>

        {/* Divider — draggable */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            'w-1.5 cursor-col-resize flex-shrink-0',
            'bg-border hover:bg-primary/50 transition-colors duration-150',
            'relative group'
          )}
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-muted-foreground/30 group-hover:bg-primary/60 transition-colors" />
        </div>

        {/* Right Pane — PDF Preview */}
        <div
          className="flex flex-col min-h-0 bg-background/50"
          style={{ width: `${100 - splitPercent}%` }}
        >
          {/* Preview Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF Preview
            </span>

            {pdfUrl && numPages && (
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <button
                  onClick={() => setPdfScale((s) => Math.max(0.5, s - 0.1))}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground w-10 text-center">
                  {Math.round(pdfScale * 100)}%
                </span>
                <button
                  onClick={() => setPdfScale((s) => Math.min(2.0, s + 0.1))}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {/* Page Navigation */}
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 rounded hover:bg-accent text-muted-foreground disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {currentPage} / {numPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    disabled={currentPage >= numPages}
                    className="p-1 rounded hover:bg-accent text-muted-foreground disabled:opacity-30"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PDF Content */}
          <div
            ref={pdfContainerRef}
            className="flex-1 overflow-auto flex items-start justify-center p-4 min-h-0"
          >
            {isCompiling && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Compiling LaTeX...</p>
                <p className="text-xs text-muted-foreground/60">This may take a few seconds</p>
              </div>
            )}

            {!isCompiling && compileError && (
              <div className="max-w-lg w-full">
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h3 className="font-semibold text-destructive text-sm">Compilation Error</h3>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 p-3 rounded-lg max-h-80 overflow-auto">
                    {compileError}
                  </pre>
                </div>
              </div>
            )}

            {!isCompiling && !compileError && !pdfUrl && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No PDF preview yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Click <strong>Compile PDF</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Ctrl+B</kbd> to generate
                </p>
              </div>
            )}

            {!isCompiling && pdfUrl && (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                }
                error={
                  <div className="text-center p-8">
                    <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Failed to load PDF</p>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={pdfScale}
                  className="shadow-2xl rounded-lg overflow-hidden"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
