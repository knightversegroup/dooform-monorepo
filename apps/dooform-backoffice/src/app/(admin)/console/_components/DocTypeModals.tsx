"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import { DocumentType } from "@dooform/shared/api/types";
import { Button } from "@dooform/shared";

// ============================================================================
// Create Document Type Modal
// ============================================================================

interface CreateDocTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDocTypeModal({ isOpen, onClose, onSuccess }: CreateDocTypeModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name_en: '',
    description: '',
    original_source: '',
    category: '',
    icon: '',
    color: '#6B7280',
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setError('Code and Name are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiClient.createDocumentType({
        code: formData.code,
        name: formData.name,
        name_en: formData.name_en || undefined,
        description: formData.description || undefined,
        original_source: formData.original_source || undefined,
        category: formData.category || undefined,
        icon: formData.icon || undefined,
        color: formData.color || undefined,
        sort_order: formData.sort_order,
      });
      onSuccess();
      onClose();
      setFormData({ code: '', name: '', name_en: '', description: '', original_source: '', category: '', icon: '', color: '#6B7280', sort_order: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document type');
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
          <h2 className="text-lg font-semibold">Create Document Type</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. thai_id_card" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. government" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="ชื่อประเภทเอกสาร" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN)</label>
            <input type="text" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Source</label>
            <input type="text" value={formData.original_source} onChange={(e) => setFormData({ ...formData, original_source: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. file-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex gap-2">
                <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-10 h-10 p-0 border rounded cursor-pointer" />
                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono" />
              </div>
            </div>
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
// Edit Document Type Modal
// ============================================================================

interface EditDocTypeModalProps {
  isOpen: boolean;
  documentType: DocumentType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDocTypeModal({ isOpen, documentType, onClose, onSuccess }: EditDocTypeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: '',
    original_source: '',
    category: '',
    icon: '',
    color: '#6B7280',
    sort_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentType) {
      setFormData({
        name: documentType.name || '',
        name_en: documentType.name_en || '',
        description: documentType.description || '',
        original_source: documentType.original_source || '',
        category: documentType.category || '',
        icon: documentType.icon || '',
        color: documentType.color || '#6B7280',
        sort_order: documentType.sort_order || 0,
        is_active: documentType.is_active ?? true,
      });
    }
  }, [documentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentType) return;

    setSaving(true);
    setError(null);

    try {
      await apiClient.updateDocumentType(documentType.id, {
        name: formData.name,
        name_en: formData.name_en || undefined,
        description: formData.description || undefined,
        original_source: formData.original_source || undefined,
        category: formData.category || undefined,
        icon: formData.icon || undefined,
        color: formData.color || undefined,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document type');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !documentType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit: {documentType.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN)</label>
            <input type="text" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Source</label>
            <input type="text" value={formData.original_source} onChange={(e) => setFormData({ ...formData, original_source: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex gap-2">
                <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-10 h-10 p-0 border rounded cursor-pointer" />
                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="doctype-active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
            <label htmlFor="doctype-active" className="text-sm text-gray-700">Active</label>
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
