"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useAuth } from "@dooform/shared/auth/hooks";
import type { WatermarkPreset } from "@dooform/shared/api/types";
import { WatermarkPreview } from "./WatermarkPreview";
import { WatermarkEditorModal } from "./WatermarkEditorModal";
import { useWatermarkPresets } from "./useWatermarkPresets";

interface WatermarkSectionProps {
  enabled: boolean;
  selectedPresetId: string | null;
  onEnabledChange: (enabled: boolean) => void;
  onSelectedPresetIdChange: (id: string | null) => void;
}

/**
 * Opt-in watermark control embedded in a download step. Lets the user
 * pick, customise, and save an emblem-style watermark preset. Only one
 * preset is selectable at a time; toggling off disables stamping without
 * destroying the selection.
 */
export function WatermarkSection({
  enabled,
  selectedPresetId,
  onEnabledChange,
  onSelectedPresetIdChange,
}: WatermarkSectionProps) {
  const { user } = useAuth();
  const { presets, loading, error, create, update, remove, uploadLogo } = useWatermarkPresets();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<WatermarkPreset | null>(null);

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || null;

  const handleCreate = () => {
    setEditingPreset(null);
    setEditorOpen(true);
  };

  const handleEdit = () => {
    if (selectedPreset) {
      setEditingPreset(selectedPreset);
      setEditorOpen(true);
    }
  };

  const defaults = {
    displayName: user?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || undefined,
    email: user?.email,
    organization: user?.organization,
  };

  return (
    <div className="flex flex-col gap-3 w-full border-t border-gray-200 pt-4 mt-2">
      {/* Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="w-4 h-4 accent-[#0b4db7]"
        />
        <span className="font-semibold text-[#171717] text-base">เพิ่มลายน้ำ</span>
      </label>

      {enabled && (
        <div className="flex flex-col gap-3 pl-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              กำลังโหลด...
            </div>
          )}
          {error && <div className="text-sm text-red-700">{error}</div>}
          {!loading && (
            <>
              {presets.length > 0 && (
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-700">เลือกลายน้ำ</span>
                  <select
                    value={selectedPresetId || ""}
                    onChange={(e) => onSelectedPresetIdChange(e.target.value || null)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm bg-white max-w-xs"
                  >
                    <option value="">-- เลือก --</option>
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
              )}

              {selectedPreset && (
                <div className="flex items-center gap-3">
                  <div className="border border-gray-200 rounded bg-white p-2">
                    <WatermarkPreview config={selectedPreset.config} width={120} height={80} />
                  </div>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-1 text-sm text-[#0b4db7] hover:underline"
                  >
                    <Pencil className="w-3 h-3" />
                    ปรับแต่ง
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleCreate}
                className="text-sm text-[#0b4db7] hover:underline self-start"
              >
                + สร้างลายน้ำใหม่
              </button>
            </>
          )}
        </div>
      )}

      <WatermarkEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        preset={editingPreset}
        defaults={defaults}
        onSave={async (name, config) => {
          if (editingPreset) {
            const updated = await update(editingPreset.id, { name, config });
            setEditingPreset(updated);
            onSelectedPresetIdChange(updated.id);
            return updated;
          }
          const created = await create({ name, config });
          setEditingPreset(created);
          onSelectedPresetIdChange(created.id);
          return created;
        }}
        onUploadLogo={uploadLogo}
        onDelete={async (id) => {
          await remove(id);
          if (selectedPresetId === id) onSelectedPresetIdChange(null);
        }}
      />
    </div>
  );
}
