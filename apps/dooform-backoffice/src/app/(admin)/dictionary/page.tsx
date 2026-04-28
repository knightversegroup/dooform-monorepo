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
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
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
  | "edit-word"
  | "bulk-upload";

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModal("bulk-upload")}
              disabled={categories.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-40"
            >
              <Upload className="w-3 h-3" />
              อัปโหลด CSV
            </button>
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
      {modal === "bulk-upload" && (
        <BulkUploadModal
          categories={categories}
          defaultCategoryId={selectedCategory}
          onClose={() => {
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

// ========== Bulk Upload Modal ==========

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

type BulkRowStatus = "pending" | "uploading" | "success" | "error";

interface BulkRow {
  word: string;
  reading: string;
  meaning: string;
  meaning_en: string;
  example: string;
  notes: string;
  category_code: string;
  status: BulkRowStatus;
  error?: string;
}

function BulkUploadModal({
  categories,
  defaultCategoryId,
  onClose,
}: {
  categories: DictionaryCategory[];
  defaultCategoryId?: string | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"select" | "preview" | "uploading" | "done">("select");
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [defaultCategory, setDefaultCategory] = useState(defaultCategoryId ?? categories[0]?.id ?? "");
  const [progress, setProgress] = useState({ success: 0, error: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);

  const categoryByCode = new Map(categories.map((c) => [c.code, c.id]));

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("กรุณาเลือกไฟล์ .csv เท่านั้น");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        alert("ไม่พบข้อมูลในไฟล์ CSV");
        return;
      }
      const bulkRows: BulkRow[] = parsed.map((r) => ({
        word: r.word ?? "",
        reading: r.reading ?? "",
        meaning: r.meaning ?? "",
        meaning_en: r.meaning_en ?? "",
        example: r.example ?? "",
        notes: r.notes ?? "",
        category_code: r.category_code ?? "",
        status: "pending" as const,
      }));
      setRows(bulkRows);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const validRows = rows.filter((r) => r.word && r.meaning);
  const invalidRows = rows.filter((r) => !r.word || !r.meaning);

  const startUpload = async () => {
    setStep("uploading");
    const total = validRows.length;
    let success = 0;
    let error = 0;
    setProgress({ success: 0, error: 0, total });

    const updated = [...rows];
    for (let i = 0; i < updated.length; i++) {
      const row = updated[i];
      if (!row.word || !row.meaning) {
        updated[i] = { ...row, status: "error", error: "ขาดข้อมูลที่จำเป็น" };
        error++;
        setRows([...updated]);
        setProgress({ success, error, total });
        continue;
      }

      const categoryId = (row.category_code && categoryByCode.get(row.category_code)) || defaultCategory;
      if (!categoryId) {
        updated[i] = { ...row, status: "error", error: "ไม่พบหมวดหมู่" };
        error++;
        setRows([...updated]);
        setProgress({ success, error, total });
        continue;
      }

      updated[i] = { ...row, status: "uploading" };
      setRows([...updated]);

      try {
        await apiClient.createDictionaryWord({
          category_id: categoryId,
          word: row.word,
          reading: row.reading || undefined,
          meaning: row.meaning,
          meaning_en: row.meaning_en || undefined,
          example: row.example || undefined,
          notes: row.notes || undefined,
        });
        updated[i] = { ...row, status: "success" };
        success++;
      } catch (err) {
        updated[i] = { ...row, status: "error", error: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" };
        error++;
      }
      setRows([...updated]);
      setProgress({ success, error, total });
    }
    setStep("done");
  };

  const downloadTemplate = () => {
    const header = "word,reading,meaning,meaning_en,example,notes,category_code";
    const example = "สัญญา,สัน-ยา,ข้อตกลงระหว่างบุคคลสองฝ่ายขึ้นไป,Contract,สัญญาเช่า,กฎหมายแพ่ง,legal_terms";
    const blob = new Blob([header + "\n" + example + "\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dictionary_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4" />
            อัปโหลด CSV คำศัพท์
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "select" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
              }`}
            >
              <FileText className="w-8 h-8 mx-auto text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-600 mb-2">ลากไฟล์ CSV มาวางที่นี่</p>
              <p className="text-xs text-neutral-400 mb-3">หรือ</p>
              <label className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                เลือกไฟล์
                <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>

            <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-neutral-600">รูปแบบ CSV ที่รองรับ:</p>
              <code className="block text-[11px] text-neutral-500 bg-white rounded p-2 overflow-x-auto">
                word,reading,meaning,meaning_en,example,notes,category_code
              </code>
              <div className="text-[11px] text-neutral-400 space-y-0.5">
                <p>* <strong>word</strong> และ <strong>meaning</strong> จำเป็นต้องมี</p>
                <p>* <strong>category_code</strong> ใช้ระบุหมวดหมู่ (ถ้าไม่ระบุจะใช้หมวดหมู่เริ่มต้น)</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <Download className="w-3 h-3" />
                ดาวน์โหลดเทมเพลต
              </button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-600">หมวดหมู่เริ่มต้น</label>
                <select
                  value={defaultCategory}
                  onChange={(e) => setDefaultCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {validRows.length} รายการพร้อม
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    {invalidRows.length} รายการไม่ครบ
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[40vh] overflow-y-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 px-2 font-medium text-neutral-500">#</th>
                    <th className="text-left py-2 px-2 font-medium text-neutral-500">คำศัพท์</th>
                    <th className="text-left py-2 px-2 font-medium text-neutral-500">ความหมาย</th>
                    <th className="text-left py-2 px-2 font-medium text-neutral-500">หมวดหมู่</th>
                    <th className="text-left py-2 px-2 font-medium text-neutral-500">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isValid = row.word && row.meaning;
                    return (
                      <tr key={idx} className={`border-b border-neutral-50 ${!isValid ? "bg-amber-50/50" : ""}`}>
                        <td className="py-1.5 px-2 text-neutral-400">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-medium text-neutral-900">{row.word || <span className="text-red-400">-</span>}</td>
                        <td className="py-1.5 px-2 text-neutral-600 max-w-[200px] truncate">{row.meaning || <span className="text-red-400">-</span>}</td>
                        <td className="py-1.5 px-2 text-neutral-500">{row.category_code || "ค่าเริ่มต้น"}</td>
                        <td className="py-1.5 px-2">
                          {isValid ? (
                            <span className="text-green-600">พร้อม</span>
                          ) : (
                            <span className="text-amber-600">ข้อมูลไม่ครบ</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => { setRows([]); setStep("select"); }}
                className="px-4 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                เลือกไฟล์ใหม่
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={startUpload}
                  disabled={validRows.length === 0}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
                >
                  อัปโหลด {validRows.length} รายการ
                </button>
              </div>
            </div>
          </div>
        )}

        {(step === "uploading" || step === "done") && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>กำลังอัปโหลด...</span>
                <span>{progress.success + progress.error} / {progress.total}</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div
                  className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total ? ((progress.success + progress.error) / progress.total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  สำเร็จ {progress.success}
                </span>
                {progress.error > 0 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    ล้มเหลว {progress.error}
                  </span>
                )}
              </div>
            </div>

            {step === "done" && progress.error > 0 && (
              <div className="max-h-[30vh] overflow-y-auto border border-neutral-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-neutral-50">
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2 px-2 font-medium text-neutral-500">คำศัพท์</th>
                      <th className="text-left py-2 px-2 font-medium text-neutral-500">ข้อผิดพลาด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.filter((r) => r.status === "error").map((row, idx) => (
                      <tr key={idx} className="border-b border-neutral-50">
                        <td className="py-1.5 px-2 font-medium text-neutral-900">{row.word || `แถว ${idx + 1}`}</td>
                        <td className="py-1.5 px-2 text-red-500">{row.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {step === "done" && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
                >
                  เสร็จสิ้น
                </button>
              </div>
            )}
          </div>
        )}
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
