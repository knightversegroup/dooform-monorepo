"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookMarked,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  Tag,
} from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import type {
  DictionaryCategory,
  DictionaryWord,
  DictionaryCategoryCreateRequest,
  DictionaryWordCreateRequest,
} from "@dooform/shared/api/types";

type ModalType =
  | null
  | "create-category"
  | "edit-category"
  | "create-word"
  | "edit-word";

export default function DictionaryManagementPage() {
  const [categories, setCategories] = useState<DictionaryCategory[]>([]);
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 30;

  // Modal state
  const [modal, setModal] = useState<ModalType>(null);
  const [editingCategory, setEditingCategory] =
    useState<DictionaryCategory | null>(null);
  const [editingWord, setEditingWord] = useState<DictionaryWord | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await apiClient.getDictionaryCategories();
      setCategories(cats ?? []);
    } catch {
      // ignore
    }
  }, []);

  const fetchWords = useCallback(async () => {
    try {
      const result = await apiClient.searchDictionaryWords({
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        page,
        limit,
      });
      setWords(result.words);
      setTotalWords(result.total);
    } catch {
      setWords([]);
      setTotalWords(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(fetchWords, 300);
    return () => clearTimeout(timer);
  }, [fetchWords]);

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("ลบหมวดหมู่นี้และคำศัพท์ทั้งหมดในหมวดหมู่?")) return;
    try {
      await apiClient.deleteDictionaryCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      fetchCategories();
      fetchWords();
    } catch {
      // ignore
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (!confirm("ลบคำศัพท์นี้?")) return;
    try {
      await apiClient.deleteDictionaryWord(id);
      fetchWords();
      fetchCategories();
    } catch {
      // ignore
    }
  };

  const totalPages = Math.ceil(totalWords / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-neutral-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              จัดการคลังคำศัพท์
            </h1>
            <p className="text-sm text-neutral-500">
              เพิ่ม แก้ไข ลบ หมวดหมู่และคำศัพท์
            </p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            หมวดหมู่
          </h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setModal("create-category");
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-3 h-3" />
            เพิ่มหมวดหมู่
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-4">
            ยังไม่มีหมวดหมู่
          </p>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-neutral-100"
                    : "hover:bg-neutral-50"
                }`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id
                  )
                }
              >
                <div className="flex items-center gap-2">
                  {selectedCategory === cat.id ? (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                  <span className="text-sm text-neutral-700">{cat.name}</span>
                  {cat.name_en && (
                    <span className="text-xs text-neutral-400">
                      ({cat.name_en})
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {cat.word_count ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(cat);
                      setModal("edit-category");
                    }}
                    className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id);
                    }}
                    className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Words Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <BookMarked className="w-4 h-4" />
            คำศัพท์
            <span className="text-neutral-400 font-normal">({totalWords})</span>
          </h2>
          <button
            onClick={() => {
              setEditingWord(null);
              setModal("create-word");
            }}
            disabled={categories.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            เพิ่มคำศัพท์
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาคำศัพท์..."
            className="w-full pl-10 pr-10 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Words Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
          </div>
        ) : words.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            {searchTerm || selectedCategory
              ? "ไม่พบคำศัพท์"
              : "ยังไม่มีคำศัพท์"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-2 px-2 text-xs font-medium text-neutral-500">
                    คำศัพท์
                  </th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-neutral-500">
                    ความหมาย
                  </th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-neutral-500">
                    หมวดหมู่
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-neutral-500 w-20">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr
                    key={word.id}
                    className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="py-2 px-2">
                      <span className="font-medium text-neutral-900">
                        {word.word}
                      </span>
                      {word.reading && (
                        <span className="text-xs text-neutral-400 ml-1">
                          ({word.reading})
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-neutral-600 max-w-[200px] truncate">
                      {word.meaning}
                    </td>
                    <td className="py-2 px-2">
                      {word.category && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-neutral-100 text-neutral-500">
                          {word.category.name}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingWord(word);
                            setModal("edit-word");
                          }}
                          className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWord(word.id)}
                          className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
            >
              ก่อนหน้า
            </button>
            <span className="text-xs text-neutral-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "create-category" && (
        <CategoryModal
          onClose={() => setModal(null)}
          onSave={async (data) => {
            await apiClient.createDictionaryCategory(data);
            setModal(null);
            fetchCategories();
          }}
        />
      )}
      {modal === "edit-category" && editingCategory && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            await apiClient.updateDictionaryCategory(editingCategory.id, data);
            setModal(null);
            fetchCategories();
            fetchWords();
          }}
        />
      )}
      {modal === "create-word" && (
        <WordModal
          categories={categories}
          defaultCategoryId={selectedCategory}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            await apiClient.createDictionaryWord(data);
            setModal(null);
            fetchWords();
            fetchCategories();
          }}
        />
      )}
      {modal === "edit-word" && editingWord && (
        <WordModal
          word={editingWord}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={async (data) => {
            await apiClient.updateDictionaryWord(editingWord.id, data);
            setModal(null);
            fetchWords();
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}

// ========== Category Modal ==========

function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category?: DictionaryCategory;
  onClose: () => void;
  onSave: (data: DictionaryCategoryCreateRequest) => Promise<void>;
}) {
  const [form, setForm] = useState({
    code: category?.code ?? "",
    name: category?.name ?? "",
    name_en: category?.name_en ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
    color: category?.color ?? "",
    sort_order: category?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      setError("กรุณากรอก Code และชื่อ");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-5">
        <h3 className="text-base font-semibold mb-4">
          {category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-600">
              Code *
            </label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              disabled={!!category}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-50"
              placeholder="legal_terms"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              ชื่อหมวดหมู่ *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="คำศัพท์กฎหมาย"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              ชื่อ (EN)
            </label>
            <input
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="Legal Terms"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              คำอธิบาย
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-600">
                ไอคอน
              </label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                placeholder="scale"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                สี
              </label>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== Word Modal ==========

function WordModal({
  word,
  categories,
  defaultCategoryId,
  onClose,
  onSave,
}: {
  word?: DictionaryWord;
  categories: DictionaryCategory[];
  defaultCategoryId?: string | null;
  onClose: () => void;
  onSave: (data: DictionaryWordCreateRequest) => Promise<void>;
}) {
  const [form, setForm] = useState({
    category_id: word?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "",
    word: word?.word ?? "",
    reading: word?.reading ?? "",
    meaning: word?.meaning ?? "",
    meaning_en: word?.meaning_en ?? "",
    example: word?.example ?? "",
    notes: word?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id || !form.word || !form.meaning) {
      setError("กรุณากรอก หมวดหมู่ คำศัพท์ และความหมาย");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-5 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold mb-4">
          {word ? "แก้ไขคำศัพท์" : "เพิ่มคำศัพท์"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-600">
              หมวดหมู่ *
            </label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              คำศัพท์ *
            </label>
            <input
              value={form.word}
              onChange={(e) => setForm({ ...form, word: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="สัญญา"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              คำอ่าน
            </label>
            <input
              value={form.reading}
              onChange={(e) => setForm({ ...form, reading: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="สัน-ยา"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              ความหมาย *
            </label>
            <textarea
              value={form.meaning}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              rows={2}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none"
              placeholder="ข้อตกลงระหว่างบุคคลสองฝ่ายขึ้นไป..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              ความหมาย (EN)
            </label>
            <input
              value={form.meaning_en}
              onChange={(e) => setForm({ ...form, meaning_en: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="Contract"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              ตัวอย่างการใช้
            </label>
            <textarea
              value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })}
              rows={2}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">
              หมายเหตุ
            </label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
