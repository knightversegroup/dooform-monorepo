"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@dooform/shared/auth/hooks";
import type { WatermarkPreset } from "@dooform/shared/api/types";
import {
  WatermarkEditorModal,
  WatermarkPreview,
  useWatermarkPresets,
} from "@/components/ui/watermark";

/**
 * Watermark gallery — users can view, create, edit, and delete their
 * saved emblem presets. Reuses WatermarkEditorModal for the full-fidelity
 * editing experience.
 */
export default function WatermarksPage() {
  const { user } = useAuth();
  const { presets, loading, error, create, update, remove, uploadLogo, refresh } =
    useWatermarkPresets();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<WatermarkPreset | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaults = {
    displayName:
      user?.display_name ||
      [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
      undefined,
    email: user?.email,
    organization: user?.organization,
  };

  const openCreate = () => {
    setEditingPreset(null);
    setEditorOpen(true);
  };

  const openEdit = (p: WatermarkPreset) => {
    setEditingPreset(p);
    setEditorOpen(true);
  };

  const handleDelete = async (p: WatermarkPreset) => {
    if (!window.confirm(`ยืนยันการลบ "${p.name}"?`)) return;
    setDeletingId(p.id);
    try {
      await remove(p.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">ลายน้ำของฉัน</h1>
          <p className="text-sm text-gray-600 mt-1">
            จัดการและปรับแต่งลายน้ำสำหรับไฟล์ PDF ของคุณ
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#0b4db7] hover:bg-[#083b8e] text-white px-4 py-2 rounded text-sm"
        >
          <Plus className="w-4 h-4" />
          สร้างลายน้ำใหม่
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 mb-4 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button
            type="button"
            onClick={refresh}
            className="ml-auto underline hover:no-underline"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#0b4db7] animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && presets.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg py-16 text-center">
          <p className="text-gray-600">ยังไม่มีลายน้ำ</p>
          <p className="text-sm text-gray-500 mt-1">
            สร้างลายน้ำแรกเพื่อเริ่มใช้งาน
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 bg-[#0b4db7] hover:bg-[#083b8e] text-white px-4 py-2 rounded text-sm"
          >
            <Plus className="w-4 h-4" />
            สร้างลายน้ำใหม่
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && presets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col"
            >
              <div className="bg-[#f6f6f6] flex items-center justify-center p-6 h-40">
                <WatermarkPreview config={p.config} width={200} height={120} />
              </div>
              <div className="flex-1 p-4 flex flex-col gap-1">
                <h3 className="font-semibold text-gray-900 truncate" title={p.name}>
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {p.config.lines.length} บรรทัด
                  {p.logo_path ? " • มีโลโก้" : ""}
                </p>
              </div>
              <div className="flex items-center justify-end gap-1 border-t border-gray-100 px-3 py-2 bg-gray-50">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="inline-flex items-center gap-1 text-sm text-[#0b4db7] hover:text-[#083b8e] px-2 py-1 rounded hover:bg-white"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  แก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-white disabled:opacity-50"
                >
                  {deletingId === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  ลบ
                </button>
              </div>
            </div>
          ))}
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
            return updated;
          }
          const created = await create({ name, config });
          setEditingPreset(created);
          return created;
        }}
        onUploadLogo={uploadLogo}
        onDelete={async (id) => {
          await remove(id);
        }}
      />
    </div>
  );
}
