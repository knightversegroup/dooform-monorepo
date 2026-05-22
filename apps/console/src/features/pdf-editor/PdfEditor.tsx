import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MousePointer2,
  Type,
  Strikethrough,
  Save,
  CheckCircle2,
  Loader2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
} from 'lucide-react';
import {
  finalizeDocument,
  getAnnotations,
  pdfPreviewUrl,
  saveAnnotations,
} from '../../lib/api/annotations';
import {
  apiBaseUrl,
  getActiveUserId,
  getActiveUserTier,
} from '../../lib/api/client';
import type { AnnotationItem } from '../../lib/api/types';
import { PdfPage, type Tool } from './PdfPage';

interface PdfEditorProps {
  documentId: string;
  onFinalized: () => void;
}

const COLORS = ['#000000', '#ff0000', '#0000ff', '#008000', '#ff6600', '#9900cc'];

export function PdfEditor({ documentId, onFinalized }: PdfEditorProps) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [version, setVersion] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeFontSize, setActiveFontSize] = useState(14);
  const [scale, setScale] = useState(1.0);

  const [history, setHistory] = useState<AnnotationItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [finalizing, setFinalizing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushHistory = useCallback(
    (next: AnnotationItem[]) => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        return [...trimmed, next];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const prev = historyIndex - 1;
    setAnnotations(history[prev]);
    setHistoryIndex(prev);
    setSaveStatus('unsaved');
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const next = historyIndex + 1;
    setAnnotations(history[next]);
    setHistoryIndex(next);
    setSaveStatus('unsaved');
  }, [canRedo, historyIndex, history]);

  // Load PDF (must use fetch with auth headers; pdfjs can't see them otherwise)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(pdfPreviewUrl(documentId), {
          headers: {
            'x-user-id': getActiveUserId(),
            'x-user-tier': getActiveUserTier(),
          },
        });
        if (!res.ok) throw new Error(`Failed to load PDF (HTTP ${res.status})`);
        const buffer = await res.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        if (cancelled) return;
        setPdfData(uint8);
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const doc = await pdfjsLib.getDocument({ data: uint8.slice() }).promise;
        if (!cancelled) setNumPages(doc.numPages);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  // Load existing annotations
  useEffect(() => {
    let cancelled = false;
    getAnnotations(documentId)
      .then((res) => {
        if (cancelled) return;
        setAnnotations(res.data ?? []);
        setVersion(res.version ?? 1);
      })
      .catch(() => {
        // ignore — no annotations yet
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const res = await saveAnnotations(documentId, annotations, version);
      if (res.version) setVersion(res.version);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
    }
  }, [annotations, documentId, version]);

  const triggerAutoSave = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 3000);
  }, [handleSave]);

  const handlePageClick = useCallback(
    (pageIndex: number, x: number, y: number) => {
      if (activeTool === 'text') {
        const newAnnotation: AnnotationItem = {
          id: crypto.randomUUID(),
          type: 'text',
          pageIndex,
          x,
          y,
          width: 150,
          height: 24,
          content: '',
          fontSize: activeFontSize,
          fontColor: activeColor,
        };
        const next = [...annotations, newAnnotation];
        setAnnotations(next);
        pushHistory(next);
        setSelectedId(newAnnotation.id);
        setActiveTool('select');
        triggerAutoSave();
      } else if (activeTool === 'select') {
        setSelectedId(null);
      }
    },
    [activeTool, activeColor, activeFontSize, triggerAutoSave, annotations, pushHistory]
  );

  const handlePageDrag = useCallback(
    (pageIndex: number, startX: number, startY: number, endX: number, endY: number) => {
      if (activeTool === 'strikethrough') {
        const newAnnotation: AnnotationItem = {
          id: crypto.randomUUID(),
          type: 'strikethrough',
          pageIndex,
          x: Math.min(startX, endX),
          y: Math.min(startY, endY),
          width: Math.abs(endX - startX),
          height: Math.abs(endY - startY) || 2,
          color: activeColor,
          lineWidth: 2,
        };
        const next = [...annotations, newAnnotation];
        setAnnotations(next);
        pushHistory(next);
        triggerAutoSave();
      }
    },
    [activeTool, activeColor, triggerAutoSave, annotations, pushHistory]
  );

  const updateAnnotation = useCallback(
    (id: string, updates: Partial<AnnotationItem>) => {
      const next = annotations.map((a) => (a.id === id ? { ...a, ...updates } : a));
      setAnnotations(next);
      triggerAutoSave();
    },
    [triggerAutoSave, annotations]
  );

  const commitAnnotationMove = useCallback(
    (id: string, x: number, y: number) => {
      const next = annotations.map((a) => (a.id === id ? { ...a, x, y } : a));
      setAnnotations(next);
      pushHistory(next);
      triggerAutoSave();
    },
    [annotations, pushHistory, triggerAutoSave]
  );

  const deleteAnnotation = useCallback(
    (id: string) => {
      const next = annotations.filter((a) => a.id !== id);
      setAnnotations(next);
      pushHistory(next);
      if (selectedId === id) setSelectedId(null);
      triggerAutoSave();
    },
    [selectedId, triggerAutoSave, annotations, pushHistory]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (document.activeElement?.tagName !== 'INPUT') {
          deleteAnnotation(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedId, deleteAnnotation]);

  const handleFinalize = useCallback(async () => {
    if (annotations.length > 0) {
      await saveAnnotations(documentId, annotations, version);
    }
    setFinalizing(true);
    try {
      await finalizeDocument(documentId);
      onFinalized();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'การยืนยันฉบับสุดท้ายไม่สำเร็จ');
    } finally {
      setFinalizing(false);
    }
  }, [annotations, documentId, version, onFinalized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-sm text-ink-muted">กำลังโหลด PDF…</span>
      </div>
    );
  }

  if (error || !pdfData) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-sm text-red-500">
        {error || 'โหลด PDF ไม่สำเร็จ'}
        <span className="ml-3 text-xs text-ink-muted">({apiBaseUrl})</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-border-default rounded-md p-3 mb-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 border-r border-border-default pr-3">
          <ToolButton active={activeTool === 'select'} onClick={() => setActiveTool('select')} title="เลือก">
            <MousePointer2 className="w-4 h-4" />
          </ToolButton>
          <ToolButton active={activeTool === 'text'} onClick={() => setActiveTool('text')} title="ข้อความ">
            <Type className="w-4 h-4" />
          </ToolButton>
          <ToolButton
            active={activeTool === 'strikethrough'}
            onClick={() => setActiveTool('strikethrough')}
            title="ขีดฆ่า"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolButton>
        </div>
        <div className="flex items-center gap-1 border-r border-border-default pr-3">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 rounded-md hover:bg-surface-alt disabled:opacity-30 disabled:cursor-not-allowed"
            title="เลิกทำ (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 rounded-md hover:bg-surface-alt disabled:opacity-30 disabled:cursor-not-allowed"
            title="ทำซ้ำ (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 border-r border-border-default pr-3">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                activeColor === color ? 'border-primary scale-110' : 'border-border-default'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 border-r border-border-default pr-3">
          <span className="text-xs text-ink-muted">ขนาด:</span>
          <select
            value={activeFontSize}
            onChange={(e) => setActiveFontSize(Number(e.target.value))}
            className="text-sm border border-border-default rounded px-1 py-0.5"
          >
            {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 border-r border-border-default pr-3">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-1 hover:bg-surface-alt rounded"
          >
            <ZoomOut className="w-4 h-4 text-ink-muted" />
          </button>
          <span className="text-xs text-ink-muted w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-1 hover:bg-surface-alt rounded"
          >
            <ZoomIn className="w-4 h-4 text-ink-muted" />
          </button>
        </div>
        {selectedId && (
          <button
            onClick={() => deleteAnnotation(selectedId)}
            className="p-2 rounded-md hover:bg-red-50 text-red-500"
            title="ลบ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1" />
        <span className="text-xs text-ink-muted">
          {saveStatus === 'saved' && 'บันทึกแล้ว'}
          {saveStatus === 'saving' && 'กำลังบันทึก…'}
          {saveStatus === 'unsaved' && 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก'}
        </span>
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border-default rounded-md hover:bg-surface-alt disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" /> บันทึก
        </button>
        <button
          onClick={handleFinalize}
          disabled={finalizing}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
        >
          {finalizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {finalizing ? 'กำลังยืนยัน…' : 'ยืนยันฉบับสุดท้าย'}
        </button>
      </div>

      {activeTool !== 'select' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-3 text-xs text-blue-700">
          {activeTool === 'text' && 'คลิกบนเอกสารเพื่อเพิ่มข้อความ'}
          {activeTool === 'strikethrough' && 'ลากบนเอกสารเพื่อขีดฆ่าข้อความ'}
        </div>
      )}

      <div className="bg-gray-100 border border-border-default rounded-md overflow-auto" style={{ height: '70vh' }}>
        <div className="flex flex-col items-center gap-4 p-4">
          {Array.from({ length: numPages }, (_, i) => (
            <PdfPage
              key={i}
              pdfData={pdfData}
              pageIndex={i}
              scale={scale}
              annotations={annotations.filter((a) => a.pageIndex === i)}
              selectedId={selectedId}
              activeTool={activeTool}
              onPageClick={handlePageClick}
              onPageDrag={handlePageDrag}
              onSelectAnnotation={setSelectedId}
              onUpdateAnnotation={updateAnnotation}
              onCommitMove={commitAnnotationMove}
              onDeleteAnnotation={deleteAnnotation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'hover:bg-surface-alt text-ink-muted'
      }`}
    >
      {children}
    </button>
  );
}
