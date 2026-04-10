"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Trash2, Upload, Loader2, Plus } from "lucide-react";
import type {
  WatermarkConfig,
  WatermarkPosition,
  WatermarkShape,
  WatermarkScope,
  WatermarkPreset,
  WatermarkLogoPosition,
} from "@dooform/shared/api/types";
import { WatermarkPreview } from "./WatermarkPreview";
import { WatermarkPagePreview } from "./WatermarkPagePreview";
import { DEFAULT_WATERMARK_CONFIG } from "./types";

interface WatermarkEditorModalProps {
  open: boolean;
  onClose: () => void;
  /** Preset being edited. Pass null to create a new one. */
  preset: WatermarkPreset | null;
  /** Prefill values for new presets (from useAuth().user). */
  defaults?: {
    displayName?: string;
    email?: string;
    organization?: string;
  };
  onSave: (name: string, config: WatermarkConfig) => Promise<WatermarkPreset>;
  onUploadLogo: (presetId: string, file: File) => Promise<WatermarkPreset>;
  onDelete?: (presetId: string) => Promise<void>;
}

// 3x3 anchor grid in row-major order. Rendered as a visual picker.
const POSITION_GRID: { value: WatermarkPosition; label: string }[] = [
  { value: "topLeft", label: "บนซ้าย" },
  { value: "topCenter", label: "บนกลาง" },
  { value: "topRight", label: "บนขวา" },
  { value: "centerLeft", label: "กลางซ้าย" },
  { value: "center", label: "กึ่งกลาง" },
  { value: "centerRight", label: "กลางขวา" },
  { value: "bottomLeft", label: "ล่างซ้าย" },
  { value: "bottomCenter", label: "ล่างกลาง" },
  { value: "bottomRight", label: "ล่างขวา" },
];

const SHAPES: { value: WatermarkShape; label: string }[] = [
  { value: "rounded", label: "กรอบโค้ง" },
  { value: "circle", label: "วงกลม" },
  { value: "none", label: "ไม่มีกรอบ" },
];

const SCOPES: { value: WatermarkScope; label: string }[] = [
  { value: "allPages", label: "ทุกหน้า" },
  { value: "firstPageOnly", label: "เฉพาะหน้าแรก" },
];

const LOGO_POSITIONS: { value: WatermarkLogoPosition; label: string }[] = [
  { value: "top", label: "ด้านบน" },
  { value: "left", label: "ซ้าย" },
  { value: "right", label: "ขวา" },
];

function buildInitialConfig(defaults?: WatermarkEditorModalProps["defaults"]): WatermarkConfig {
  const lines: { text: string; bold?: boolean; size?: number }[] = [];
  if (defaults?.organization) lines.push({ text: defaults.organization, bold: true, size: 12 });
  if (defaults?.displayName) lines.push({ text: defaults.displayName, size: 10 });
  if (defaults?.email) lines.push({ text: defaults.email, size: 9 });
  if (lines.length === 0) {
    return { ...DEFAULT_WATERMARK_CONFIG };
  }
  return {
    ...DEFAULT_WATERMARK_CONFIG,
    lines,
  };
}

export function WatermarkEditorModal({
  open,
  onClose,
  preset,
  defaults,
  onSave,
  onUploadLogo,
  onDelete,
}: WatermarkEditorModalProps) {
  const [name, setName] = useState("");
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (preset) {
      setName(preset.name);
      setConfig(preset.config);
    } else {
      setName("ลายน้ำของฉัน");
      setConfig(buildInitialConfig(defaults));
    }
    setError(null);
  }, [open, preset, defaults]);

  const handleLineChange = (idx: number, patch: Partial<{ text: string; bold: boolean; size: number }>) => {
    setConfig((c) => ({
      ...c,
      lines: c.lines.map((ln, i) => (i === idx ? { ...ln, ...patch } : ln)),
    }));
  };

  const addLine = () => {
    setConfig((c) => ({
      ...c,
      lines: [...c.lines, { text: "", size: 10 }],
    }));
  };

  const removeLine = (idx: number) => {
    setConfig((c) => ({
      ...c,
      lines: c.lines.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = useCallback(async () => {
    setError(null);
    if (!name.trim()) {
      setError("กรุณาตั้งชื่อลายน้ำ");
      return;
    }
    if (config.lines.length === 0 || config.lines.every((l) => !l.text.trim())) {
      setError("กรุณากรอกข้อความอย่างน้อย 1 บรรทัด");
      return;
    }
    setSaving(true);
    try {
      const cleaned: WatermarkConfig = {
        ...config,
        lines: config.lines.filter((l) => l.text.trim().length > 0),
      };
      await onSave(name.trim(), cleaned);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }, [name, config, onSave, onClose]);

  const handleLogoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !preset) return;
    setError(null);
    setUploadingLogo(true);
    try {
      await onUploadLogo(preset.id, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดโลโก้ไม่สำเร็จ");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [preset, onUploadLogo]);

  const handleDelete = useCallback(async () => {
    if (!preset || !onDelete) return;
    if (!window.confirm("ยืนยันการลบลายน้ำนี้?")) return;
    try {
      await onDelete(preset.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }, [preset, onDelete, onClose]);

  const isUnsaved = useMemo(() => !preset, [preset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-auto rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {preset ? "แก้ไขลายน้ำ" : "สร้างลายน้ำใหม่"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 p-1"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left column: form */}
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">ชื่อลายน้ำ</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b4db7]"
              />
            </label>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ข้อความ</span>
                <button
                  type="button"
                  onClick={addLine}
                  disabled={config.lines.length >= 8}
                  className="text-xs text-[#0b4db7] hover:underline inline-flex items-center gap-1 disabled:text-gray-400"
                >
                  <Plus className="w-3 h-3" />
                  เพิ่มบรรทัด
                </button>
              </div>
              {config.lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => handleLineChange(idx, { text: e.target.value })}
                    placeholder={`บรรทัดที่ ${idx + 1}`}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b4db7]"
                  />
                  <input
                    type="number"
                    value={line.size ?? 11}
                    min={6}
                    max={36}
                    step={1}
                    onChange={(e) => handleLineChange(idx, { size: Number(e.target.value) })}
                    className="w-14 border border-gray-300 rounded px-2 py-2 text-sm shrink-0"
                    title="ขนาดตัวอักษร (pt)"
                    aria-label="ขนาดตัวอักษร"
                  />
                  <label className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                    <input
                      type="checkbox"
                      checked={!!line.bold}
                      onChange={(e) => handleLineChange(idx, { bold: e.target.checked })}
                    />
                    หนา
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={config.lines.length <= 1}
                    className="text-red-500 hover:text-red-700 disabled:text-gray-300 p-1"
                    aria-label="ลบบรรทัด"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">สี</span>
                <input
                  type="color"
                  value={config.fontColor}
                  onChange={(e) => setConfig((c) => ({ ...c, fontColor: e.target.value }))}
                  className="h-10 w-full border border-gray-300 rounded"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">ความโปร่งแสง</span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={config.opacity}
                  onChange={(e) => setConfig((c) => ({ ...c, opacity: Number(e.target.value) }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">การหมุน (°)</span>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  value={config.rotation}
                  onChange={(e) => setConfig((c) => ({ ...c, rotation: Number(e.target.value) }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">รูปทรง</span>
                <select
                  value={config.shape}
                  onChange={(e) => setConfig((c) => ({ ...c, shape: e.target.value as WatermarkShape }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                >
                  {SHAPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">ขอบเขต</span>
                <select
                  value={config.scope}
                  onChange={(e) => setConfig((c) => ({ ...c, scope: e.target.value as WatermarkScope }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                >
                  {SCOPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Position picker: 3x3 anchor grid + fine-tune offsets */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">ตำแหน่งลายน้ำ</span>
              <div
                className="grid grid-cols-3 gap-1 border border-gray-200 bg-gray-50 p-2 rounded w-[132px] aspect-[1/1.414]"
                role="radiogroup"
                aria-label="เลือกตำแหน่งลายน้ำ"
              >
                {POSITION_GRID.map((p) => {
                  const active = config.position === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, position: p.value }))}
                      title={p.label}
                      aria-label={p.label}
                      aria-checked={active}
                      role="radio"
                      className={`w-full h-full rounded transition-colors flex items-center justify-center ${
                        active
                          ? "bg-[#0b4db7] border border-[#0b4db7]"
                          : "bg-white border border-gray-300 hover:border-[#0b4db7]"
                      }`}
                    >
                      {active && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-600">เลื่อนซ้าย/ขวา: {config.offsetX ?? 0} มม.</span>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={1}
                    value={config.offsetX ?? 0}
                    onChange={(e) => setConfig((c) => ({ ...c, offsetX: Number(e.target.value) }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-600">เลื่อนขึ้น/ลง: {config.offsetY ?? 0} มม.</span>
                  <input
                    type="range"
                    min={-150}
                    max={150}
                    step={1}
                    value={config.offsetY ?? 0}
                    onChange={(e) => setConfig((c) => ({ ...c, offsetY: Number(e.target.value) }))}
                  />
                </label>
              </div>
              {(config.offsetX || config.offsetY) ? (
                <button
                  type="button"
                  onClick={() => setConfig((c) => ({ ...c, offsetX: 0, offsetY: 0 }))}
                  className="self-start text-xs text-[#0b4db7] hover:underline"
                >
                  รีเซ็ตการเลื่อน
                </button>
              ) : null}
            </div>

            {/* Logo upload + sizing + placement */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">โลโก้ (ไม่บังคับ)</span>
              {isUnsaved ? (
                <p className="text-xs text-gray-500">บันทึกลายน้ำก่อนเพื่ออัปโหลดโลโก้</p>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-1 border border-gray-300 rounded px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    เลือกรูป (PNG/JPEG, ≤5 MB)
                  </button>
                  {preset?.logo_path && (
                    <span className="text-xs text-green-700">มีโลโก้แล้ว</span>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleLogoChange}
              />

              {/* Logo size + placement (apply even before upload so the preset
                 keeps the preference for future uploads). */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-600">ขนาดโลโก้: {Math.round(config.logoSize ?? 14)} มม.</span>
                  <input
                    type="range"
                    min={5}
                    max={80}
                    step={1}
                    value={config.logoSize ?? 14}
                    onChange={(e) => setConfig((c) => ({ ...c, logoSize: Number(e.target.value) }))}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-600">ตำแหน่งโลโก้</span>
                  <div className="flex gap-1">
                    {LOGO_POSITIONS.map((lp) => {
                      const active = (config.logoPosition ?? "top") === lp.value;
                      return (
                        <button
                          key={lp.value}
                          type="button"
                          onClick={() => setConfig((c) => ({ ...c, logoPosition: lp.value }))}
                          className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                            active
                              ? "bg-[#0b4db7] text-white border-[#0b4db7]"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#0b4db7]"
                          }`}
                        >
                          {lp.label}
                        </button>
                      );
                    })}
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Right column: live previews (page placement + emblem detail) */}
          <div className="flex flex-col items-center justify-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-gray-700">ตำแหน่งบนหน้ากระดาษ</span>
              <WatermarkPagePreview config={config} height={240} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-gray-700">รายละเอียดลายน้ำ</span>
              <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                <WatermarkPreview config={config} width={220} height={140} />
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              ตัวอย่างอาจแตกต่างเล็กน้อยจากไฟล์จริง
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div>
            {preset && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
                ลบลายน้ำ
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#0b4db7] hover:bg-[#083b8e] text-white text-sm px-4 py-2 rounded disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
