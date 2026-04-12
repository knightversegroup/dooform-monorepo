"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import type { AnnotationItem } from "@dooform/shared/api/types";
import { PdfPage } from "./PdfPage";

type Tool = "select" | "text" | "strikethrough";

interface PdfEditorProps {
  documentId: string;
  onFinalized: () => void;
}

export function PdfEditor({ documentId, onFinalized }: PdfEditorProps) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Annotations
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [version, setVersion] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Tools
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeFontSize, setActiveFontSize] = useState(14);
  const [scale, setScale] = useState(1.0);

  // Undo/Redo history
  const [history, setHistory] = useState<AnnotationItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Save state
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [finalizing, setFinalizing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Push current annotations to history stack
  const pushHistory = useCallback((newAnnotations: AnnotationItem[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newAnnotations];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const prevIndex = historyIndex - 1;
    setAnnotations(history[prevIndex]);
    setHistoryIndex(prevIndex);
    setSaveStatus("unsaved");
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const nextIndex = historyIndex + 1;
    setAnnotations(history[nextIndex]);
    setHistoryIndex(nextIndex);
    setSaveStatus("unsaved");
  }, [canRedo, historyIndex, history]);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .getPDFPreview(documentId)
      .then(async (blob) => {
        if (cancelled) return;
        const buffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        setPdfData(uint8);

        // Get page count via pdfjs
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjsLib.getDocument({ data: uint8.slice() }).promise;
        setNumPages(doc.numPages);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  // Load existing annotations
  useEffect(() => {
    apiClient.getAnnotations(documentId).then((res) => {
      if (res.annotation) {
        try {
          const items: AnnotationItem[] = JSON.parse(res.annotation.data);
          setAnnotations(items);
          setVersion(res.annotation.version);
        } catch {
          /* no existing annotations */
        }
      }
    });
  }, [documentId]);

  // Auto-save debounced
  const triggerAutoSave = useCallback(() => {
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 3000);
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const data = JSON.stringify(annotations);
      const res = await apiClient.saveAnnotations(documentId, data, version);
      if (res.annotation) {
        setVersion(res.annotation.version);
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  }, [annotations, documentId, version]);

  // Add text annotation
  const handlePageClick = useCallback(
    (pageIndex: number, x: number, y: number) => {
      if (activeTool === "text") {
        const newAnnotation: AnnotationItem = {
          id: crypto.randomUUID(),
          type: "text",
          pageIndex,
          x,
          y,
          width: 150,
          height: 24,
          content: "",
          fontSize: activeFontSize,
          fontColor: activeColor,
        };
        const next = [...annotations, newAnnotation];
        setAnnotations(next);
        pushHistory(next);
        setSelectedId(newAnnotation.id);
        setActiveTool("select");
        triggerAutoSave();
      } else if (activeTool === "select") {
        setSelectedId(null);
      }
    },
    [activeTool, activeColor, activeFontSize, triggerAutoSave, annotations, pushHistory]
  );

  // Add strikethrough via drag
  const handlePageDrag = useCallback(
    (pageIndex: number, startX: number, startY: number, endX: number, endY: number) => {
      if (activeTool === "strikethrough") {
        const newAnnotation: AnnotationItem = {
          id: crypto.randomUUID(),
          type: "strikethrough",
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
      // Don't push to history on every keystroke — only on move end
    },
    [triggerAutoSave, annotations]
  );

  // Called when a drag-move ends (pushes to history)
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (selectedId && (e.key === "Delete" || e.key === "Backspace")) {
        // Only delete if not focused on an input
        if (document.activeElement?.tagName !== "INPUT") {
          deleteAnnotation(selectedId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selectedId, deleteAnnotation]);

  const handleFinalize = useCallback(async () => {
    if (annotations.length > 0) {
      // Save first
      const data = JSON.stringify(annotations);
      await apiClient.saveAnnotations(documentId, data, version);
    }

    setFinalizing(true);
    try {
      await apiClient.finalizeDocument(documentId);
      onFinalized();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Finalization failed");
    } finally {
      setFinalizing(false);
    }
  }, [annotations, documentId, version, onFinalized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="w-8 h-8 text-[#007398] animate-spin" />
        <span className="ml-3 text-sm text-gray-500">กำลังโหลด PDF...</span>
      </div>
    );
  }

  if (error || !pdfData) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-sm text-red-500">
        {error || "ไม่สามารถโหลด PDF ได้"}
      </div>
    );
  }

  const COLORS = ["#000000", "#ff0000", "#0000ff", "#008000", "#ff6600", "#9900cc"];

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 flex items-center gap-3 flex-wrap">
        {/* Tool Buttons */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={() => setActiveTool("select")}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === "select" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="เลือก"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("text")}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === "text" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="เพิ่มข้อความ"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("strikethrough")}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === "strikethrough" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="ขีดฆ่า"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="เลิกทำ (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="ทำซ้ำ (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                activeColor === color ? "border-blue-500 scale-110" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <span className="text-xs text-gray-500">ขนาด:</span>
          <select
            value={activeFontSize}
            onChange={(e) => setActiveFontSize(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded px-1 py-0.5"
          >
            {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} className="p-1 hover:bg-gray-100 rounded">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} className="p-1 hover:bg-gray-100 rounded">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Delete selected */}
        {selectedId && (
          <button
            onClick={() => deleteAnnotation(selectedId)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
            title="ลบ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save Status */}
        <span className="text-xs text-gray-400">
          {saveStatus === "saved" && "บันทึกแล้ว"}
          {saveStatus === "saving" && "กำลังบันทึก..."}
          {saveStatus === "unsaved" && "ยังไม่ได้บันทึก"}
        </span>

        {/* Save & Finalize */}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          บันทึก
        </button>
        <button
          onClick={handleFinalize}
          disabled={finalizing}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-[#000091] text-white rounded-lg hover:bg-[#000070] disabled:opacity-50"
        >
          {finalizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {finalizing ? "กำลังสร้าง..." : "สร้างไฟล์สุดท้าย"}
        </button>
      </div>

      {/* Tool hint */}
      {activeTool !== "select" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3 text-xs text-blue-700">
          {activeTool === "text" && "คลิกบนเอกสารเพื่อเพิ่มข้อความ"}
          {activeTool === "strikethrough" && "ลากเมาส์บนเอกสารเพื่อขีดฆ่า"}
        </div>
      )}

      {/* PDF Pages */}
      <div
        className="bg-gray-100 border border-gray-200 rounded-lg overflow-auto"
        style={{ height: "65vh" }}
      >
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
