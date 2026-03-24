"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Download, Save, Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { PdfToolbar } from "./PdfToolbar";
import { PdfAnnotation } from "./PdfAnnotation";
import type {
  Annotation,
  AnnotationTool,
  TextStyle,
} from "./types";
import { DEFAULT_TEXT_STYLE } from "./types";

interface PdfEditorProps {
  pdfBlob: Blob;
  fileName: string;
  onSave?: (editedBlob: Blob) => void;
}

let pdfjsLib: typeof import("pdfjs-dist") | null = null;
let pdfLibModule: typeof import("pdf-lib") | null = null;

async function loadPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  }
  return pdfjsLib;
}

async function loadPdfLib() {
  if (!pdfLibModule) {
    pdfLibModule = await import("pdf-lib");
  }
  return pdfLibModule;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatThaiDate(): string {
  const now = new Date();
  const day = now.getDate();
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];
  const month = thaiMonths[now.getMonth()];
  const year = now.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RenderTask = { promise: Promise<void>; cancel: () => void } | any;

export function PdfEditor({ pdfBlob, fileName, onSave }: PdfEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [pageDimensions, setPageDimensions] = useState<
    { width: number; height: number }[]
  >([]);

  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool>("text");
  const [currentStyle, setCurrentStyle] = useState<TextStyle>({
    ...DEFAULT_TEXT_STYLE,
  });
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);

  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const containerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  const renderTasksRef = useRef<Map<number, RenderTask>>(new Map());

  // Cancel any in-progress render for a given page
  const cancelPageRender = useCallback((pageIdx: number) => {
    const existing = renderTasksRef.current.get(pageIdx);
    if (existing) {
      try {
        existing.cancel();
      } catch {
        // already finished or cancelled
      }
      renderTasksRef.current.delete(pageIdx);
    }
  }, []);

  // Render a single page to its canvas
  const renderPage = useCallback(
    async (pageIdx: number, canvas: HTMLCanvasElement) => {
      const doc = pdfDocRef.current;
      if (!doc) return;

      // Cancel any previous render on this canvas
      cancelPageRender(pageIdx);

      const page = await doc.getPage(pageIdx + 1);
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTasksRef.current.set(pageIdx, renderTask);

      try {
        await renderTask.promise;
      } catch {
        // render was cancelled — that's fine
      } finally {
        // Clean up if this is still the active task
        if (renderTasksRef.current.get(pageIdx) === renderTask) {
          renderTasksRef.current.delete(pageIdx);
        }
      }
    },
    [scale, cancelPageRender]
  );

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        if (cancelled) return;
        pdfDocRef.current = doc;
        setPageCount(doc.numPages);

        const dims: { width: number; height: number }[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale });
          dims.push({ width: viewport.width, height: viewport.height });
        }
        setPageDimensions(dims);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfBlob]);

  // Re-render current page when scale changes
  useEffect(() => {
    if (!pdfDocRef.current || loading) return;

    async function updateDimensionsAndRender() {
      const doc = pdfDocRef.current;
      const dims: { width: number; height: number }[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        dims.push({ width: viewport.width, height: viewport.height });
      }
      setPageDimensions(dims);

      // Re-render the current page canvas if it exists
      const canvas = canvasRefs.current.get(currentPage);
      if (canvas) {
        renderPage(currentPage, canvas);
      }
    }

    updateDimensionsAndRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  // Render page when currentPage changes and canvas is available
  useEffect(() => {
    if (!pdfDocRef.current || loading) return;
    const canvas = canvasRefs.current.get(currentPage);
    if (canvas) {
      renderPage(currentPage, canvas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Set canvas ref and trigger initial render for that page
  const setCanvasRef = useCallback(
    (pageIdx: number, el: HTMLCanvasElement | null) => {
      if (!el) return;
      canvasRefs.current.set(pageIdx, el);
      renderPage(pageIdx, el);
    },
    [renderPage]
  );

  const setContainerRef = useCallback(
    (pageIdx: number, el: HTMLDivElement | null) => {
      if (el) containerRefs.current.set(pageIdx, el);
    },
    []
  );

  // Add annotation on click
  const handlePageClick = useCallback(
    (e: React.MouseEvent, pageIndex: number) => {
      // Deselect if clicking empty area
      if ((e.target as HTMLElement).closest("[data-annotation]")) return;
      setSelectedAnnotationId(null);

      const container = containerRefs.current.get(pageIndex);
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      let text = "";
      let type: Annotation["type"] = "text";
      let href: string | undefined;

      if (activeTool === "date") {
        text = formatThaiDate();
        type = "date";
      } else if (activeTool === "link") {
        const url = prompt("กรุณาใส่ URL:");
        if (!url) return;
        text = prompt("ข้อความที่แสดง:", url) || url;
        type = "link";
        href = url;
      } else {
        text = "ข้อความ";
        type = "text";
      }

      const newAnnotation: Annotation = {
        id: generateId(),
        pageIndex,
        x,
        y,
        text,
        style: { ...currentStyle },
        type,
        href,
      };

      setUndoStack((prev) => [...prev, annotations]);
      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
    },
    [activeTool, currentStyle, annotations]
  );

  const handleAnnotationUpdate = useCallback(
    (id: string, updates: Partial<Annotation>) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    },
    []
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setAnnotations(prev);
    setUndoStack((s) => s.slice(0, -1));
    setSelectedAnnotationId(null);
  }, [undoStack]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedAnnotationId) return;
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations((prev) =>
      prev.filter((a) => a.id !== selectedAnnotationId)
    );
    setSelectedAnnotationId(null);
  }, [selectedAnnotationId, annotations]);

  const handleStyleChange = useCallback(
    (updates: Partial<TextStyle>) => {
      setCurrentStyle((prev) => ({ ...prev, ...updates }));
      // Also update selected annotation's style
      if (selectedAnnotationId) {
        setAnnotations((prev) =>
          prev.map((a) =>
            a.id === selectedAnnotationId
              ? { ...a, style: { ...a.style, ...updates } }
              : a
          )
        );
      }
    },
    [selectedAnnotationId]
  );

  // Save / Export PDF with annotations burned in
  const handleExport = useCallback(async () => {
    setSaving(true);
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const fontkit = (await import("@pdf-lib/fontkit")).default;
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      pdfDoc.registerFontkit(fontkit);

      // Load Thai-compatible font (Noto Sans Thai supports both Thai and Latin)
      const fontResponse = await fetch("/fonts/NotoSansThai.ttf");
      const fontBytes = await fontResponse.arrayBuffer();
      const thaiFont = await pdfDoc.embedFont(fontBytes, { subset: true });

      // For bold, use IBM Plex Sans Thai SemiBold
      const boldFontResponse = await fetch("/fonts/IBMPlexSansThai-SemiBold.ttf");
      const boldFontBytes = await boldFontResponse.arrayBuffer();
      const thaiFontBold = await pdfDoc.embedFont(boldFontBytes, { subset: true });

      const pages = pdfDoc.getPages();

      for (const annotation of annotations) {
        const page = pages[annotation.pageIndex];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();
        const font = annotation.style.bold ? thaiFontBold : thaiFont;
        const fontSize = annotation.style.fontSize;

        // Convert percentage position to PDF coordinates
        // PDF origin is bottom-left, screen origin is top-left
        const pdfX = (annotation.x / 100) * pageWidth;
        const pdfY = pageHeight - (annotation.y / 100) * pageHeight - fontSize;

        // Parse color hex to rgb
        const hex = annotation.style.color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        // Draw text
        page.drawText(annotation.text, {
          x: pdfX,
          y: pdfY,
          size: fontSize,
          font,
          color: rgb(r, g, b),
        });

        // Draw strikethrough line
        if (annotation.style.strikethrough) {
          const textWidth = font.widthOfTextAtSize(annotation.text, fontSize);
          const lineY = pdfY + fontSize * 0.35;
          page.drawLine({
            start: { x: pdfX, y: lineY },
            end: { x: pdfX + textWidth, y: lineY },
            thickness: 1,
            color: rgb(r, g, b),
          });
        }
      }

      const editedBytes = await pdfDoc.save();
      const editedBlob = new Blob([new Uint8Array(editedBytes) as BlobPart], {
        type: "application/pdf",
      });

      onSave?.(editedBlob);
      return editedBlob;
    } catch (err) {
      console.error("Failed to export PDF:", err);
      return null;
    } finally {
      setSaving(false);
    }
  }, [pdfBlob, annotations, onSave]);

  const handleDownload = useCallback(async () => {
    const blob = annotations.length > 0 ? await handleExport() : pdfBlob;
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [annotations, handleExport, pdfBlob, fileName]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selectedAnnotationId &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement) &&
          !(e.target as HTMLElement).isContentEditable
        ) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleDeleteSelected, selectedAnnotationId]);

  // Cleanup render tasks on unmount
  useEffect(() => {
    return () => {
      renderTasksRef.current.forEach((task) => {
        try {
          task.cancel();
        } catch {
          // already done
        }
      });
      renderTasksRef.current.clear();
    };
  }, []);

  const pageAnnotations = useMemo(
    () =>
      annotations.filter((a) => a.pageIndex === currentPage),
    [annotations, currentPage]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#000091] animate-spin" />
          <p className="text-sm text-gray-600">กำลังโหลด PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <PdfToolbar
        activeTool={activeTool}
        style={currentStyle}
        canUndo={undoStack.length > 0}
        selectedAnnotationId={selectedAnnotationId}
        onToolChange={setActiveTool}
        onStyleChange={handleStyleChange}
        onUndo={handleUndo}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Page navigation and zoom */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            หน้า {currentPage + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
            }
            disabled={currentPage === pageCount - 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Page with annotation overlay */}
      <div className="flex justify-center overflow-auto bg-gray-100 rounded-lg border border-gray-200 p-4 max-h-[70vh]">
        {pageDimensions[currentPage] && (
          <div
            ref={(el) => setContainerRef(currentPage, el)}
            className="relative shadow-lg cursor-crosshair"
            style={{
              width: pageDimensions[currentPage].width,
              height: pageDimensions[currentPage].height,
            }}
            onClick={(e) => handlePageClick(e, currentPage)}
          >
            <canvas
              key={currentPage}
              ref={(el) => setCanvasRef(currentPage, el)}
              className="block"
            />
            {/* Annotation layer */}
            <div className="absolute inset-0 pointer-events-none">
              {pageAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  data-annotation
                  className="pointer-events-auto"
                >
                  <PdfAnnotation
                    annotation={annotation}
                    isSelected={selectedAnnotationId === annotation.id}
                    containerWidth={pageDimensions[currentPage].width}
                    containerHeight={pageDimensions[currentPage].height}
                    onSelect={() => setSelectedAnnotationId(annotation.id)}
                    onUpdate={(updates) =>
                      handleAnnotationUpdate(annotation.id, updates)
                    }
                    onDoubleClick={() =>
                      setSelectedAnnotationId(annotation.id)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500 px-2">
        คลิกบนเอกสารเพื่อเพิ่มข้อความ • ดับเบิลคลิกที่ annotation เพื่อแก้ไข
        • ลากเพื่อย้ายตำแหน่ง • Ctrl+Z เพื่อเลิกทำ
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={saving}
          className="
            bg-[#000091] text-white px-4 py-2.5 text-sm
            hover:bg-[#000070] transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            inline-flex items-center gap-2 rounded
          "
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              ดาวน์โหลด PDF
            </>
          )}
        </button>
        {annotations.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            disabled={saving}
            className="
              bg-white text-[#000091] px-4 py-2.5 text-sm
              hover:bg-[#000091]/5 transition-colors
              border border-[#000091]
              disabled:opacity-50 disabled:cursor-not-allowed
              inline-flex items-center gap-2 rounded
            "
          >
            <Save className="w-4 h-4" />
            บันทึกการแก้ไข
          </button>
        )}
      </div>
    </div>
  );
}
