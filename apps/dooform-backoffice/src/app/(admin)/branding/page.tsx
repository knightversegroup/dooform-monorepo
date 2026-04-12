'use client';

import { useState, useEffect, useCallback } from 'react';
import { Paintbrush, RotateCcw, Save, Plus, Trash2, Eye } from 'lucide-react';
import { apiClient } from '@dooform/shared/api/client';
import type { WatermarkConfig, WatermarkLine } from '@dooform/shared/api/types';
import { LogoLoaderInline } from '@dooform/shared';

const DEFAULT_CONFIG: WatermarkConfig = {
  lines: [{ text: 'สร้างโดย Dooform', bold: true, size: 12 }],
  fontColor: '#cccccc',
  opacity: 0.2,
  rotation: -30,
  position: 'center',
  shape: 'none',
  scope: 'allPages',
};

export default function BrandingWatermarkPage() {
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiClient.getBrandingWatermark();
      setConfig(result.config);
      setIsDefault(result.is_default);
    } catch (err) {
      console.error('Failed to fetch branding config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await apiClient.updateBrandingWatermark(config);
      setIsDefault(false);
      setMessage({ type: 'success', text: 'บันทึกการตั้งค่าลายน้ำสำเร็จ' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'ไม่สามารถบันทึกได้' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('รีเซ็ตลายน้ำเป็นค่าเริ่มต้น?')) return;
    try {
      await apiClient.resetBrandingWatermark();
      setConfig(DEFAULT_CONFIG);
      setIsDefault(true);
      setMessage({ type: 'success', text: 'รีเซ็ตลายน้ำเป็นค่าเริ่มต้นสำเร็จ' });
    } catch (err) {
      setMessage({ type: 'error', text: 'ไม่สามารถรีเซ็ตได้' });
    }
  };

  const updateLine = (index: number, updates: Partial<WatermarkLine>) => {
    setConfig(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => i === index ? { ...line, ...updates } : line),
    }));
  };

  const addLine = () => {
    if (config.lines.length >= 8) return;
    setConfig(prev => ({
      ...prev,
      lines: [...prev.lines, { text: '', bold: false, size: 10 }],
    }));
  };

  const removeLine = (index: number) => {
    if (config.lines.length <= 1) return;
    setConfig(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LogoLoaderInline size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Paintbrush className="w-6 h-6 text-blue-600" />
          ลายน้ำ Dooform
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          กำหนดลายน้ำที่แสดงบนเอกสาร PDF ของผู้ใช้ Free tier
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900">การตั้งค่า</h3>

          {/* Text Lines */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">ข้อความ (สูงสุด 8 บรรทัด)</label>
            <div className="space-y-2">
              {config.lines.map((line, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => updateLine(i, { text: e.target.value })}
                    placeholder={`บรรทัดที่ ${i + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={line.size || 12}
                    onChange={(e) => updateLine(i, { size: Number(e.target.value) })}
                    className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center"
                    min={6}
                    max={48}
                    title="ขนาดตัวอักษร"
                  />
                  <label className="flex items-center gap-1 text-xs text-gray-500">
                    <input
                      type="checkbox"
                      checked={line.bold || false}
                      onChange={(e) => updateLine(i, { bold: e.target.checked })}
                      className="rounded"
                    />
                    หนา
                  </label>
                  {config.lines.length > 1 && (
                    <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {config.lines.length < 8 && (
              <button onClick={addLine} className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                <Plus className="w-3 h-3" /> เพิ่มบรรทัด
              </button>
            )}
          </div>

          {/* Color & Opacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">สีตัวอักษร</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={config.fontColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.fontColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">ความโปร่งใส ({Math.round(config.opacity * 100)}%)</label>
              <input
                type="range"
                min={5}
                max={100}
                value={Math.round(config.opacity * 100)}
                onChange={(e) => setConfig(prev => ({ ...prev, opacity: Number(e.target.value) / 100 }))}
                className="w-full mt-2"
              />
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">การหมุน ({config.rotation}°)</label>
            <input
              type="range"
              min={-180}
              max={180}
              value={config.rotation}
              onChange={(e) => setConfig(prev => ({ ...prev, rotation: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            {!isDefault && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                รีเซ็ต
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            ตัวอย่าง
          </h3>
          <div className="relative bg-white border border-gray-300 rounded-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
            {/* Simulated A4 page with document content */}
            <div className="absolute inset-0 p-6 text-[7px] text-gray-800 leading-relaxed font-serif">
              <div className="text-center mb-3">
                <div className="font-bold text-[9px]">(Official Emblem)</div>
                <div className="font-bold text-[8px]">Copy of House Registration</div>
                <div className="text-[6px]">Department of Provincial Administration</div>
              </div>
              <div className="border border-gray-400 p-2 mb-2">
                <div className="flex justify-between mb-1">
                  <span>Article ________</span>
                  <span>3: ________</span>
                </div>
                <div className="text-center font-bold mb-1">Penalty</div>
                <div className="text-[6px] leading-tight">
                  Anyone fails to observe Article 1-3 shall be liable to a fine of not exceeding 1,000 Baht.
                  Anyone makes, uses, or presents false evidence shall be liable to imprisonment.
                </div>
              </div>
              <div className="border border-gray-400 p-2">
                <div className="text-center font-bold mb-1">House Particulars</div>
                <div className="flex justify-between text-[6px]">
                  <span>House Code No.: ________</span>
                  <span>Registration Office: ________</span>
                </div>
                <div className="text-[6px] mt-1">Address: ________________________________</div>
                <div className="flex justify-between text-[6px] mt-1">
                  <span>Name of Village: ________</span>
                  <span>Name of House: ________</span>
                </div>
              </div>
            </div>
            {/* Watermark overlay - 3x3 grid (boosted opacity for preview visibility) */}
            {['top', 'center', 'bottom'].map((y) =>
              ['left', 'center', 'right'].map((x) => (
                <div
                  key={`${y}-${x}`}
                  className="absolute flex items-center justify-center pointer-events-none"
                  style={{
                    top: y === 'top' ? '8%' : y === 'center' ? '38%' : '68%',
                    left: x === 'left' ? '2%' : x === 'center' ? '32%' : '62%',
                    width: '36%',
                    height: '22%',
                    transform: `rotate(${config.rotation}deg)`,
                    opacity: Math.max(config.opacity, 0.4), // Boost for preview visibility
                  }}
                >
                  <div className="text-center whitespace-nowrap" style={{ color: config.fontColor }}>
                    {config.lines.map((line, i) => (
                      <div
                        key={i}
                        style={{ fontSize: `${Math.max(7, (line.size || 12) * 0.6)}px`, fontWeight: line.bold ? 700 : 400 }}
                      >
                        {line.text || '...'}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            ตัวอย่าง: ลายน้ำจะแสดงซ้ำ 9 ตำแหน่ง ทุกหน้า (ความโปร่งใสจริง: {Math.round(config.opacity * 100)}%)
          </p>
        </div>
      </div>
    </div>
  );
}
