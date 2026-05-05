import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import {
  createWatermarkPreset,
  deleteWatermarkPreset,
  listWatermarkPresets,
  updateWatermarkPreset,
  uploadWatermarkLogo,
  watermarkLogoUrl,
} from '../lib/api/watermarks';
import { getActiveUserId, getActiveUserTier } from '../lib/api/client';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { WatermarkConfig, WatermarkPreset } from '../lib/api/types';
import { useCan } from '../lib/auth/useCan';

const DEFAULT_CONFIG: WatermarkConfig = {
  lines: [{ text: 'CONFIDENTIAL', bold: true, size: 36 }],
  fontColor: '#888888',
  opacity: 0.3,
  rotation: -30,
  position: 'center',
  scope: 'all',
};

export default function WatermarksPage() {
  const canManage = useCan('watermarks:manage');
  const queryClient = useQueryClient();
  const presetsQuery = useQuery({
    queryKey: queryKeys.watermarks.list(),
    queryFn: () => listWatermarkPresets(),
  });

  const [editing, setEditing] = useState<WatermarkPreset | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWatermarkPreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watermarks.all });
    },
  });

  return (
    <div>
      <PageHeader
        title="Watermark presets"
        description="Configure watermarks to apply during PDF download."
        actions={
          canManage ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" /> New preset
            </Button>
          ) : null
        }
      />

      <section className="px-6 py-6 space-y-4">
        {presetsQuery.isLoading ? <PageLoader /> : null}
        {presetsQuery.error ? <ErrorMessage error={presetsQuery.error} /> : null}

        {presetsQuery.data?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {presetsQuery.data.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                canManage={canManage}
                onEdit={() => setEditing(preset)}
                onDelete={() => {
                  if (confirm(`Delete preset "${preset.name}"?`)) {
                    deleteMutation.mutate(preset.id);
                  }
                }}
              />
            ))}
          </div>
        ) : !presetsQuery.isLoading ? (
          <p className="text-sm text-ink-muted">
            No presets yet. Create one to get started.
          </p>
        ) : null}

        {deleteMutation.error ? (
          <ErrorMessage error={deleteMutation.error} />
        ) : null}
      </section>

      {(creating || editing) && (
        <PresetEditor
          preset={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.watermarks.all });
          }}
        />
      )}
    </div>
  );
}

function PresetCard({
  preset,
  canManage,
  onEdit,
  onDelete,
}: {
  preset: WatermarkPreset;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-ink truncate">{preset.name}</div>
          <div className="text-xs text-ink-muted">
            {preset.config.lines?.length ?? 0} line(s)
          </div>
        </div>
        {canManage ? (
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded hover:bg-surface-alt text-ink-muted"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded hover:bg-red-50 text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="text-xs text-ink-muted space-y-1">
        {preset.config.lines?.map((line, idx) => (
          <div key={idx} className="truncate">
            {line.bold ? <strong>{line.text}</strong> : line.text}
          </div>
        ))}
      </div>
      {preset.logoPath ? (
        <img
          src={watermarkLogoUrl(preset.id) + `?cache=${preset.updatedAt ?? ''}`}
          alt="Logo"
          className="h-12 w-auto object-contain bg-surface-alt rounded p-1"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
          // attach auth headers via crossOrigin not possible; rely on proxy
        />
      ) : null}
    </div>
  );
}

function PresetEditor({
  preset,
  onClose,
  onSaved,
}: {
  preset: WatermarkPreset | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!preset;
  const [name, setName] = useState(preset?.name ?? '');
  const [config, setConfig] = useState<WatermarkConfig>(
    preset?.config ?? DEFAULT_CONFIG
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const presetId = preset?.id;
      let saved: WatermarkPreset;
      if (presetId) {
        saved = await updateWatermarkPreset(presetId, { name, config });
      } else {
        saved = await createWatermarkPreset({ name, config });
      }
      if (logoFile) {
        await uploadWatermarkLogo(saved.id, logoFile);
      }
      return saved;
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  const updateLine = (idx: number, key: keyof WatermarkConfig['lines'][number], value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === idx ? { ...line, [key]: value } : line
      ),
    }));
  };

  const addLine = () => {
    setConfig((prev) => ({
      ...prev,
      lines: [...prev.lines, { text: '', bold: false, size: 24 }],
    }));
  };

  const removeLine = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border-subtle px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit preset' : 'New watermark preset'}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Input
            label="Preset name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Confidential"
          />

          <div>
            <label className="text-sm font-medium text-ink-subtle">Lines</label>
            <div className="mt-2 space-y-2">
              {config.lines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 border border-border-subtle rounded-md p-2"
                >
                  <input
                    value={line.text}
                    onChange={(e) => updateLine(idx, 'text', e.target.value)}
                    placeholder="Watermark text"
                    className="flex-1 px-2 py-1 text-sm border border-border-subtle rounded"
                  />
                  <input
                    type="number"
                    value={line.size ?? 24}
                    onChange={(e) => updateLine(idx, 'size', Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-border-subtle rounded"
                  />
                  <label className="inline-flex items-center gap-1 text-xs text-ink-muted">
                    <input
                      type="checkbox"
                      checked={!!line.bold}
                      onChange={(e) => updateLine(idx, 'bold', e.target.checked)}
                    />
                    Bold
                  </label>
                  <button
                    onClick={() => removeLine(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="w-3.5 h-3.5" /> Add line
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="text-xs text-ink-muted">Color</span>
              <input
                type="color"
                value={config.fontColor ?? '#888888'}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, fontColor: e.target.value }))
                }
                className="mt-1 h-9 w-full border border-border-subtle rounded"
              />
            </label>
            <label>
              <span className="text-xs text-ink-muted">Opacity</span>
              <input
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={config.opacity ?? 0.3}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                }
                className="mt-1 w-full px-3 py-2 text-sm border border-border-subtle rounded-md"
              />
            </label>
            <label>
              <span className="text-xs text-ink-muted">Rotation (degrees)</span>
              <input
                type="number"
                value={config.rotation ?? -30}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, rotation: Number(e.target.value) }))
                }
                className="mt-1 w-full px-3 py-2 text-sm border border-border-subtle rounded-md"
              />
            </label>
            <label>
              <span className="text-xs text-ink-muted">Position</span>
              <select
                value={config.position ?? 'center'}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, position: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 text-sm border border-border-subtle rounded-md"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="diagonal">Diagonal</option>
              </select>
            </label>
          </div>

          <div>
            <span className="text-sm font-medium text-ink-subtle">Logo</span>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-border-subtle rounded-md cursor-pointer hover:bg-surface-alt text-sm">
                <Upload className="w-4 h-4" />
                {logoFile ? logoFile.name : 'Upload PNG/JPEG'}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {preset?.logoPath ? (
                <img
                  src={watermarkLogoUrl(preset.id)}
                  alt=""
                  className="h-10 object-contain bg-surface-alt rounded p-1"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              Auth headers required to view logo in app: x-user-id=
              {getActiveUserId()}, x-user-tier={getActiveUserTier()}.
            </p>
          </div>

          {saveMutation.error ? <ErrorMessage error={saveMutation.error} /> : null}
        </div>

        <div className="border-t border-border-subtle px-5 py-3 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !name.trim()}
          >
            {saveMutation.isPending ? <Spinner className="text-white" /> : null}
            {isEdit ? 'Save changes' : 'Create preset'}
          </Button>
        </div>
      </div>
    </div>
  );
}
