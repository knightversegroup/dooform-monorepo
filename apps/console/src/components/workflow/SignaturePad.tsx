import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eraser, PenLine } from 'lucide-react';
import {
  createSignature,
  deleteSignature,
  listSignatures,
} from '../../lib/api/signatures';
import { queryKeys } from '../../lib/queryClient';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Spinner } from '../ui/Spinner';

interface SignaturePadProps {
  documentId: string;
  canSign: boolean;
  currentUserId: string;
}

export function SignaturePad({
  documentId,
  canSign,
  currentUserId,
}: SignaturePadProps) {
  const queryClient = useQueryClient();
  const sigQuery = useQuery({
    queryKey: queryKeys.signatures.forDocument(documentId),
    queryFn: () => listSignatures(documentId),
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const start = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasInk(true);
  };
  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas missing');
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png')
      );
      // Default placement on page 1, scaled to fit a typical A4 footer area in PDF points.
      return createSignature(documentId, {
        imageBlob: blob,
        pageIndex: 0,
        x: 60,
        y: 60,
        width: 200,
        height: 80,
      });
    },
    onSuccess: () => {
      clear();
      queryClient.invalidateQueries({
        queryKey: queryKeys.signatures.forDocument(documentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.detail(documentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.forDocument(documentId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSignature(documentId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.signatures.forDocument(documentId),
      });
    },
  });

  const sigs = sigQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-2">
          ลายเซ็นที่มีอยู่ ({sigs.length})
        </h3>
        {sigs.length === 0 ? (
          <p className="text-sm text-ink-muted">ยังไม่มีลายเซ็น</p>
        ) : (
          <ul className="space-y-2">
            {sigs.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-md border border-border-default bg-white p-2"
              >
                <img
                  src={s.imagePath}
                  alt="ลายเซ็น"
                  className="h-10 bg-surface-alt rounded border border-border-default"
                />
                <div className="text-xs">
                  <div className="font-medium text-ink">{s.userId}</div>
                  <div className="text-ink-muted">
                    หน้า {s.pageIndex + 1} · {new Date(s.signedAt).toLocaleString('th-TH')}
                  </div>
                </div>
                {s.userId === currentUserId ? (
                  <button
                    onClick={() => deleteMutation.mutate(s.id)}
                    className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canSign ? (
        <div>
          <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-2">
            เพิ่มลายเซ็นของคุณ
          </h3>
          <div className="border-2 border-dashed border-border-default rounded-md bg-white">
            <canvas
              ref={canvasRef}
              width={500}
              height={160}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              className="w-full touch-none cursor-crosshair"
            />
          </div>
          {submitMutation.error ? (
            <ErrorMessage error={submitMutation.error} className="mt-2" />
          ) : null}
          <div className="flex items-center justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={clear} disabled={!hasInk}>
              <Eraser className="w-4 h-4" /> ล้าง
            </Button>
            <Button
              size="sm"
              onClick={() => submitMutation.mutate()}
              disabled={!hasInk || submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Spinner className="text-white" />
              ) : (
                <PenLine className="w-4 h-4" />
              )}
              ลงนาม
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-muted">
          เอกสารต้องมีสถานะ APPROVED และคุณต้องมีสิทธิ์ editor ขึ้นไปจึงจะลงนามได้
        </p>
      )}
    </div>
  );
}
