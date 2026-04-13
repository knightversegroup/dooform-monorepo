"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  BookMarked,
  Tag,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import type {
  DictionaryCategory,
  DictionaryWord,
} from "@dooform/shared/api/types";

export default function DictionaryPage() {
  const [categories, setCategories] = useState<DictionaryCategory[]>([]);
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    apiClient
      .getDictionaryCategories()
      .then((cats) => setCategories(cats ?? []))
      .catch(() => setCategories([]));
  }, []);

  const fetchWords = useCallback(async () => {
    setSearchLoading(true);
    try {
      const result = await apiClient.searchDictionaryWords({
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        page,
        limit,
      });
      setWords(result.words ?? []);
      setTotalWords(result.total ?? 0);
    } catch {
      setWords([]);
      setTotalWords(0);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, page]);

  useEffect(() => {
    const timer = setTimeout(fetchWords, 300);
    return () => clearTimeout(timer);
  }, [fetchWords]);

  const groupedWords = useMemo(() => {
    const groups: Record<string, DictionaryWord[]> = {};
    words.forEach((w) => {
      const firstChar = w.word.charAt(0).toUpperCase();
      if (!groups[firstChar]) groups[firstChar] = [];
      groups[firstChar].push(w);
    });
    return Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b, "th")
    );
  }, [words]);

  const totalPages = Math.ceil(totalWords / limit);
  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-neutral-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              คลังคำศัพท์
            </h1>
            <p className="text-sm text-neutral-500">
              ค้นหาคำศัพท์สำหรับการกรอกเอกสาร
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Categories */}
        <aside className="w-56 shrink-0">
          <div className="sticky top-4">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
              หมวดหมู่
            </h2>
            <nav className="space-y-0.5">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  !selectedCategory
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4" />
                  ทั้งหมด
                </span>
                <span
                  className={`text-xs ${
                    !selectedCategory
                      ? "text-neutral-300"
                      : "text-neutral-400"
                  }`}
                >
                  {categories.reduce(
                    (sum, c) => sum + (c.word_count ?? 0),
                    0
                  )}
                </span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    );
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Tag className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span
                    className={`text-xs shrink-0 ml-2 ${
                      selectedCategory === cat.id
                        ? "text-neutral-300"
                        : "text-neutral-400"
                    }`}
                  >
                    {cat.word_count ?? 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาคำศัพท์..."
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 transition-colors"
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

          {/* Results Info */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-neutral-500">
              {searchLoading ? (
                "กำลังค้นหา..."
              ) : (
                <>
                  พบ {totalWords} คำ
                  {selectedCategoryData && (
                    <> ในหมวด &quot;{selectedCategoryData.name}&quot;</>
                  )}
                  {searchTerm && <> สำหรับ &quot;{searchTerm}&quot;</>}
                </>
              )}
            </p>
          </div>

          {/* Word List */}
          {words.length === 0 && !searchLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 mb-3 rounded-xl bg-neutral-100 flex items-center justify-center">
                <BookMarked className="w-6 h-6 text-neutral-300" />
              </div>
              <p className="text-sm text-neutral-500">
                {searchTerm || selectedCategory
                  ? "ไม่พบคำศัพท์ที่ตรงกับการค้นหา"
                  : "ยังไม่มีคำศัพท์ในระบบ"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedWords.map(([letter, letterWords]) => (
                <div key={letter}>
                  <div className="sticky top-0 z-10 bg-neutral-50/90 backdrop-blur-sm px-3 py-1.5 rounded-lg mb-1">
                    <span className="text-xs font-semibold text-neutral-500">
                      {letter}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {letterWords.map((word) => (
                      <WordCard key={word.id} word={word} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50 transition-colors"
              >
                ก่อนหน้า
              </button>
              <span className="text-xs text-neutral-500">
                หน้า {page} จาก {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50 transition-colors"
              >
                ถัดไป
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function WordCard({ word }: { word: DictionaryWord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group border border-neutral-100 rounded-xl px-4 py-3 hover:border-neutral-200 transition-colors cursor-pointer bg-white"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900">
              {word.word}
            </span>
            {word.reading && (
              <span className="text-xs text-neutral-400">({word.reading})</span>
            )}
          </div>
          <p className="text-sm text-neutral-600 mt-0.5 line-clamp-1">
            {word.meaning}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {word.category && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-neutral-100 text-neutral-500">
              {word.category.name}
            </span>
          )}
          <ChevronRight
            className={`w-4 h-4 text-neutral-300 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
          <div>
            <span className="text-xs font-medium text-neutral-500">
              ความหมาย
            </span>
            <p className="text-sm text-neutral-700">{word.meaning}</p>
            {word.meaning_en && (
              <p className="text-xs text-neutral-400 mt-0.5">
                {word.meaning_en}
              </p>
            )}
          </div>
          {word.example && (
            <div>
              <span className="text-xs font-medium text-neutral-500">
                ตัวอย่าง
              </span>
              <p className="text-sm text-neutral-700">{word.example}</p>
            </div>
          )}
          {word.notes && (
            <div>
              <span className="text-xs font-medium text-neutral-500">
                หมายเหตุ
              </span>
              <p className="text-sm text-neutral-700">{word.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
