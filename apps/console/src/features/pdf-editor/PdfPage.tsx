import { useRef, useEffect, useState, useCallback, CSSProperties } from 'react';
import type { AnnotationItem } from '../../lib/api/types';
import './pdf-text-layer.css';
import './pdf-editor-overrides.css';

export type Tool = 'select' | 'text' | 'strikethrough';

interface PdfPageProps {
  pdfData: Uint8Array;
  pageIndex: number;
  scale: number;
  annotations: AnnotationItem[];
  selectedId: string | null;
  activeTool: Tool;
  onPageClick: (pageIndex: number, x: number, y: number) => void;
  onPageDrag: (pageIndex: number, startX: number, startY: number, endX: number, endY: number) => void;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (id: string, updates: Partial<AnnotationItem>) => void;
  onCommitMove: (id: string, x: number, y: number) => void;
  onDeleteAnnotation: (id: string) => void;
}

export function PdfPage({
  pdfData,
  pageIndex,
  scale,
  annotations,
  selectedId,
  activeTool,
  onPageClick,
  onPageDrag,
  onSelectAnnotation,
  onUpdateAnnotation,
  onCommitMove,
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  const [strikeDragStart, setStrikeDragStart] = useState<{ x: number; y: number } | null>(null);
  const [strikeDragEnd, setStrikeDragEnd] = useState<{ x: number; y: number } | null>(null);

  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveOffset, setMoveOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      const doc = await pdfjsLib.getDocument({ data: pdfData.slice() }).promise;
      const page = await doc.getPage(pageIndex + 1);
      if (cancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageSize({ width: viewport.width, height: viewport.height });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;

      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = '';
        textLayerRef.current.style.width = `${viewport.width}px`;
        textLayerRef.current.style.height = `${viewport.height}px`;
        const textContent = await page.getTextContent();
        const { TextLayer } = await import('pdfjs-dist');
        const textLayer = new TextLayer({
          textContentSource: textContent,
          container: textLayerRef.current,
          viewport,
        });
        await textLayer.render();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfData, pageIndex, scale]);

  const pixelToPdfPoint = useCallback(
    (px: number, py: number) => ({ x: px / scale, y: py / scale }),
    [scale]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (movingId) return;
      const rect = overlayRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const pt = pixelToPdfPoint(px, py);
      onPageClick(pageIndex, pt.x, pt.y);
    },
    [pageIndex, onPageClick, pixelToPdfPoint, movingId]
  );

  const handleOverlayMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'strikethrough') return;
      e.preventDefault();
      const rect = overlayRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setStrikeDragStart({ x: px, y: py });
      setStrikeDragEnd({ x: px, y: py });
    },
    [activeTool]
  );

  const handleOverlayMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (strikeDragStart) {
        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect) return;
        setStrikeDragEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        return;
      }
      if (movingId) {
        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect) return;
        const px = e.clientX - rect.left - moveOffset.x;
        const py = e.clientY - rect.top - moveOffset.y;
        const pt = pixelToPdfPoint(px, py);
        onUpdateAnnotation(movingId, { x: pt.x, y: pt.y });
      }
    },
    [strikeDragStart, movingId, moveOffset, pixelToPdfPoint, onUpdateAnnotation]
  );

  const handleOverlayMouseUp = useCallback(() => {
    if (strikeDragStart && strikeDragEnd) {
      const startPt = pixelToPdfPoint(strikeDragStart.x, strikeDragStart.y);
      const endPt = pixelToPdfPoint(strikeDragEnd.x, strikeDragEnd.y);
      if (Math.abs(endPt.x - startPt.x) > 5) {
        onPageDrag(pageIndex, startPt.x, startPt.y, endPt.x, endPt.y);
      }
      setStrikeDragStart(null);
      setStrikeDragEnd(null);
      return;
    }
    if (movingId) {
      const ann = annotations.find((a) => a.id === movingId);
      if (ann) onCommitMove(movingId, ann.x, ann.y);
      setMovingId(null);
    }
  }, [strikeDragStart, strikeDragEnd, pageIndex, onPageDrag, pixelToPdfPoint, movingId, annotations, onCommitMove]);

  const handleAnnotationMouseDown = useCallback(
    (e: React.MouseEvent, annId: string) => {
      if (activeTool !== 'select') return;
      e.stopPropagation();
      e.preventDefault();
      onSelectAnnotation(annId);
      const rect = overlayRef.current?.getBoundingClientRect();
      if (!rect) return;
      const ann = annotations.find((a) => a.id === annId);
      if (!ann) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setMoveOffset({ x: mx - ann.x * scale, y: my - ann.y * scale });
      setMovingId(annId);
    },
    [activeTool, annotations, scale, onSelectAnnotation]
  );

  const handleTextLayerClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'strikethrough') return;
      const target = e.target as HTMLElement;
      if (target.tagName !== 'SPAN' || !textLayerRef.current?.contains(target)) return;
      e.stopPropagation();
      const overlayRect = overlayRef.current?.getBoundingClientRect();
      const spanRect = target.getBoundingClientRect();
      if (!overlayRect) return;
      const left = spanRect.left - overlayRect.left;
      const top = spanRect.top - overlayRect.top;
      const width = spanRect.width;
      const height = spanRect.height;
      const pt = pixelToPdfPoint(left, top + height / 2);
      const ptWidth = width / scale;
      onPageDrag(pageIndex, pt.x, pt.y, pt.x + ptWidth, pt.y);
    },
    [activeTool, pixelToPdfPoint, scale, onPageDrag, pageIndex]
  );

  const cursorClass =
    activeTool === 'text'
      ? 'cursor-text'
      : activeTool === 'strikethrough'
      ? 'cursor-crosshair'
      : movingId
      ? 'cursor-grabbing'
      : 'cursor-default';

  const toolModeClass =
    activeTool === 'strikethrough'
      ? 'strikethrough-mode'
      : activeTool === 'text'
      ? 'text-mode'
      : 'select-mode';

  const wrapperStyle: CSSProperties = {
    width: pageSize.width || 'auto',
    height: pageSize.height || 'auto',
    ['--total-scale-factor' as string]: scale,
    ['--scale-round-x' as string]: '1px',
    ['--scale-round-y' as string]: '1px',
  };

  return (
    <div className={`relative shadow-lg bg-white ${toolModeClass}`} style={wrapperStyle}>
      <canvas ref={canvasRef} className="block" />
      <div
        ref={textLayerRef}
        className="absolute inset-0 textLayer"
        onClick={handleTextLayerClick}
      />
      <div
        ref={overlayRef}
        className={`absolute inset-0 ${cursorClass}`}
        onClick={handleOverlayClick}
        onMouseDown={handleOverlayMouseDown}
        onMouseMove={handleOverlayMouseMove}
        onMouseUp={handleOverlayMouseUp}
        onMouseLeave={handleOverlayMouseUp}
      >
        {strikeDragStart && strikeDragEnd && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={strikeDragStart.x}
              y1={strikeDragStart.y}
              x2={strikeDragEnd.x}
              y2={strikeDragEnd.y}
              stroke="red"
              strokeWidth={2}
              strokeDasharray="4"
            />
          </svg>
        )}
        {annotations.map((ann) => {
          const isSelected = ann.id === selectedId;
          const isMoving = ann.id === movingId;
          if (ann.type === 'text') {
            return (
              <div
                key={ann.id}
                className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'}`}
                style={{ left: ann.x * scale, top: ann.y * scale, minWidth: 40 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAnnotation(ann.id);
                }}
              >
                <div
                  className="absolute -left-5 top-0 w-4 h-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100"
                  style={{ opacity: isSelected || isMoving ? 0.7 : undefined }}
                  onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)}
                  title="ลากเพื่อย้าย"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" className="text-gray-400">
                    <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                    <circle cx="6" cy="2" r="1.5" fill="currentColor" />
                    <circle cx="2" cy="7" r="1.5" fill="currentColor" />
                    <circle cx="6" cy="7" r="1.5" fill="currentColor" />
                    <circle cx="2" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div
                  className="absolute inset-0 border-2 border-transparent hover:border-blue-300 cursor-grab active:cursor-grabbing"
                  style={{ pointerEvents: isSelected ? 'none' : 'auto' }}
                  onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)}
                />
                <input
                  type="text"
                  value={ann.content || ''}
                  onChange={(e) => onUpdateAnnotation(ann.id, { content: e.target.value })}
                  placeholder="พิมพ์…"
                  className="bg-transparent border-none outline-none p-0 m-0 relative z-10"
                  style={{
                    fontSize: (ann.fontSize || 14) * scale,
                    color: ann.fontColor || '#000',
                    minWidth: 60 * scale,
                    fontFamily: 'Sarabun, sans-serif',
                    cursor: 'text',
                  }}
                  autoFocus={isSelected && !ann.content}
                />
              </div>
            );
          }
          if (ann.type === 'strikethrough') {
            return (
              <div
                key={ann.id}
                className={`absolute ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:ring-1 hover:ring-blue-300'}`}
                style={{
                  left: ann.x * scale,
                  top: ann.y * scale,
                  width: ann.width * scale,
                  height: Math.max((ann.height || 2) * scale, 8),
                  cursor: activeTool === 'select' ? (isMoving ? 'grabbing' : 'grab') : 'pointer',
                }}
                onMouseDown={(e) => handleAnnotationMouseDown(e, ann.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAnnotation(ann.id);
                }}
              >
                <svg width="100%" height="100%" className="pointer-events-none">
                  <line
                    x1="0"
                    y1="50%"
                    x2="100%"
                    y2="50%"
                    stroke={ann.color || '#ff0000'}
                    strokeWidth={ann.lineWidth || 2}
                  />
                </svg>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
