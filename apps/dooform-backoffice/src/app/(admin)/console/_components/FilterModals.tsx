"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import { FilterCategory, FilterOption } from "@dooform/shared/api/types";
import { Button } from "@dooform/shared";

// ============================================================================
// Create Filter Modal
// ============================================================================

interface CreateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFilterModal({ isOpen, onClose, onSuccess }: CreateFilterModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name_en: '',
    description: '',
    field_name: '',
    sort_order: 0,
  });
  const [options, setOptions] = useState<{ value: string; label: string; color: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.field_name) {
      setError('Code, Name, and Field Name are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const category = await apiClient.createFilterCategory({
        code: formData.code,
        name: formData.name,
        name_en: formData.name_en || undefined,
        description: formData.description || undefined,
        field_name: formData.field_name,
        sort_order: formData.sort_order,
      });

      // Add options if any
      for (const opt of options) {
        if (opt.value && opt.label) {
          await apiClient.createFilterOption({
            filter_category_id: category.id,
            value: opt.value,
            label: opt.label,
            color: opt.color || undefined,
          });
        }
      }

      onSuccess();
      onClose();
      setFormData({ code: '', name: '', name_en: '', description: '', field_name: '', sort_order: 0 });
      setOptions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create filter');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Filter Category</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. category" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name *</label>
              <input type="text" value={formData.field_name} onChange={(e) => setFormData({ ...formData, field_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. category" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="ชื่อหมวดหมู่" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN)</label>
            <input type="text" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Options</label>
              <button type="button" onClick={() => setOptions([...options, { value: '', label: '', color: '' }])} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="text" placeholder="value" value={opt.value} onChange={(e) => { const next = [...options]; next[i].value = e.target.value; setOptions(next); }} className="flex-1 px-2 py-1.5 border rounded text-sm" />
                <input type="text" placeholder="label" value={opt.label} onChange={(e) => { const next = [...options]; next[i].label = e.target.value; setOptions(next); }} className="flex-1 px-2 py-1.5 border rounded text-sm" />
                <input type="color" value={opt.color || '#6B7280'} onChange={(e) => { const next = [...options]; next[i].color = e.target.value; setOptions(next); }} className="w-8 h-8 p-0 border rounded cursor-pointer" />
                <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Creating...</> : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Edit Filter Modal (with option editing)
// ============================================================================

interface EditableOption {
  id?: string;          // undefined = new option
  value: string;
  label: string;
  color: string;
  is_active: boolean;
  _deleted?: boolean;   // marked for deletion
}

interface EditFilterModalProps {
  isOpen: boolean;
  filterCategory: FilterCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFilterModal({ isOpen, filterCategory, onClose, onSuccess }: EditFilterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: '',
    field_name: '',
    sort_order: 0,
    is_active: true,
  });
  const [options, setOptions] = useState<EditableOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (filterCategory) {
      setFormData({
        name: filterCategory.name || '',
        name_en: filterCategory.name_en || '',
        description: filterCategory.description || '',
        field_name: filterCategory.field_name || '',
        sort_order: filterCategory.sort_order || 0,
        is_active: filterCategory.is_active ?? true,
      });
      setOptions(
        (filterCategory.options || []).map((o) => ({
          id: o.id,
          value: o.value,
          label: o.label,
          color: o.color || '',
          is_active: o.is_active ?? true,
        }))
      );
    }
  }, [filterCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterCategory) return;

    setSaving(true);
    setError(null);

    try {
      // 1. Update category metadata
      await apiClient.updateFilterCategory(filterCategory.id, {
        name: formData.name,
        name_en: formData.name_en || undefined,
        description: formData.description || undefined,
        field_name: formData.field_name,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      });

      // 2. Process option changes
      for (const opt of options) {
        if (opt._deleted && opt.id) {
          // Delete existing option
          await apiClient.deleteFilterOption(opt.id);
        } else if (!opt._deleted && opt.id) {
          // Update existing option
          await apiClient.updateFilterOption(opt.id, {
            value: opt.value,
            label: opt.label,
            color: opt.color || undefined,
            is_active: opt.is_active,
          });
        } else if (!opt._deleted && !opt.id && opt.value && opt.label) {
          // Create new option
          await apiClient.createFilterOption({
            filter_category_id: filterCategory.id,
            value: opt.value,
            label: opt.label,
            color: opt.color || undefined,
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update filter');
    } finally {
      setSaving(false);
    }
  };

  const updateOption = (index: number, updates: Partial<EditableOption>) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...updates } : o)));
  };

  if (!isOpen || !filterCategory) return null;

  const visibleOptions = options.filter((o) => !o._deleted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Filter: {filterCategory.code}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}

          {/* Category fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
              <input type="text" value={formData.field_name} onChange={(e) => setFormData({ ...formData, field_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="filter-active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
            <label htmlFor="filter-active" className="text-sm text-gray-700">Active</label>
          </div>

          {/* Options section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-800">Options ({visibleOptions.length})</label>
              <button
                type="button"
                onClick={() => setOptions([...options, { value: '', label: '', color: '', is_active: true }])}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>

            {/* Header */}
            {visibleOptions.length > 0 && (
              <div className="flex items-center gap-2 mb-1 px-1 text-xs text-gray-500 font-medium">
                <span className="w-[140px]">Value</span>
                <span className="flex-1">Label</span>
                <span className="w-8">Color</span>
                <span className="w-16 text-center">Active</span>
                <span className="w-8" />
              </div>
            )}

            <div className="space-y-1.5">
              {options.map((opt, i) => {
                if (opt._deleted) return null;
                return (
                  <div key={opt.id || `new-${i}`} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                    <input
                      type="text"
                      placeholder="value"
                      value={opt.value}
                      onChange={(e) => updateOption(i, { value: e.target.value })}
                      className="w-[140px] px-2 py-1.5 border rounded text-sm font-mono"
                    />
                    <input
                      type="text"
                      placeholder="label"
                      value={opt.label}
                      onChange={(e) => updateOption(i, { label: e.target.value })}
                      className="flex-1 px-2 py-1.5 border rounded text-sm"
                    />
                    <input
                      type="color"
                      value={opt.color || '#6B7280'}
                      onChange={(e) => updateOption(i, { color: e.target.value })}
                      className="w-8 h-8 p-0 border rounded cursor-pointer"
                    />
                    <div className="w-16 flex justify-center">
                      <input
                        type="checkbox"
                        checked={opt.is_active}
                        onChange={(e) => updateOption(i, { is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (opt.id) {
                          updateOption(i, { _deleted: true });
                        } else {
                          setOptions(options.filter((_, j) => j !== i));
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving...</> : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
