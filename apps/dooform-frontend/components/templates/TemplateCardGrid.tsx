"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Clock,
  TableOfContents,
  TriangleAlert,
  Eye,
  Pencil,
} from "lucide-react";
import { LogoLoaderInline } from "@dooform/shared";
import { apiClient } from "@dooform/shared/api/client";
import {
  FilterCategory,
  Template,
  DocumentType,
} from "@dooform/shared/api/types";

// ============================================================================
// Sub-components
// ============================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LogoLoaderInline size="lg" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <p className="text-sm text-red-600 mb-4">{message}</p>
      <button onClick={onRetry} className="text-sm text-[#000091] hover:text-[#000091]/80 font-medium">
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-gray-900 font-medium">ไม่พบเอกสาร</p>
      <p className="text-sm text-gray-500 mt-1">ยังไม่มีเอกสารในระบบ</p>
    </div>
  );
}

function TemplateRow({
  template,
  isSelected,
  categoryLabel,
  onSelect,
}: {
  template: Template;
  isSelected: boolean;
  categoryLabel: string;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    onSelect();
    setExpanded((prev) => !prev);
  };

  const formattedDate = template.updated_at
    ? new Date(template.updated_at).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) +
      " " +
      new Date(template.updated_at).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " น."
    : "-";

  return (
    <div className="w-full">
      {/* Header row — white, top rounded when expanded */}
      <button
        onClick={handleClick}
        className={`w-full text-left p-4 border border-[#e6e6e6] bg-white transition-all duration-150 ${
          expanded ? "rounded-t-lg" : "rounded-lg"
        } ${isSelected ? "border-[#013087]/30" : "hover:border-[#b3b3b3]"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
            <p className={`text-sm font-semibold truncate ${isSelected ? "text-[#013087]" : "text-[#4d4d4d]"}`}>
              {template.name}
            </p>
            <p className="text-xs text-[#808080] truncate">
              หมวดหมู่: {categoryLabel}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {expanded ? (
              <ChevronUp className="w-3 h-3 text-[#4d4d4d]" />
            ) : (
              <ChevronDown className="w-3 h-3 text-[#4d4d4d]" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded details — fafafa bg, bottom rounded */}
      {expanded && (
        <div className="bg-[#fafafa] border border-t-0 border-[#e6e6e6] rounded-b-lg p-4 flex flex-col gap-2">
          {/* Info rows */}
          <div className="flex flex-col gap-px">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#808080] flex-shrink-0" />
              <span className="text-xs text-[#808080]">แก้ไขล่าสุด: {formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <TableOfContents className="w-3 h-3 text-[#808080] flex-shrink-0" />
              <span className="text-xs text-[#808080]">หมวดหมู่: {categoryLabel}</span>
            </div>
            {template.remarks && (
              <div className="flex items-center gap-1">
                <TriangleAlert className="w-3 h-3 text-[#808080] flex-shrink-0" />
                <span className="text-xs text-[#808080]">หมายเหตุ: {template.remarks}</span>
              </div>
            )}
          </div>

          {/* Action buttons — right aligned */}
          <div className="flex items-center justify-end gap-0.5">
            <Link
              href={`/forms/${template.id}`}
              className="inline-flex items-center gap-0.5 px-2 py-1 bg-white border border-[#e6e6e6] rounded-full text-xs font-medium text-[#4d4d4d] hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-2.5 h-2.5" />
              ดูตัวอย่าง
            </Link>
            <Link
              href={`/forms/${template.id}/fill`}
              className="inline-flex items-center gap-0.5 px-2 py-1 bg-white border border-[#e6e6e6] rounded-full text-xs font-medium text-[#4d4d4d] hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-2.5 h-2.5" />
              กรอกฟอร์ม
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Custom Hook
// ============================================================================

function useGroupedTemplateData() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [orphanTemplates, setOrphanTemplates] = useState<Template[]>([]);
  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [grouped, filtersResponse] = await Promise.all([
          apiClient.getTemplatesGrouped(),
          apiClient.getFilters().catch(() => [] as FilterCategory[]),
        ]);

        setDocumentTypes(grouped.document_types || []);
        setOrphanTemplates(grouped.orphan_templates || []);
        setFilterCategories(filtersResponse.filter((f) => f.is_active));
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { documentTypes, orphanTemplates, filterCategories, loading, error };
}

// ============================================================================
// Main Component
// ============================================================================

export default function TemplateCardGrid() {
  const { documentTypes, orphanTemplates, filterCategories, loading, error } = useGroupedTemplateData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [imgError, setImgError] = useState(false);

  // Reset image error when selected template changes
  useEffect(() => {
    setImgError(false);
  }, [selectedTemplate?.id]);

  // Category labels from filter data
  const categoryLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    filterCategories.forEach((filter) => {
      if (filter.field_name === "category") {
        filter.options?.forEach((opt) => {
          labels[opt.value] = opt.label;
        });
      }
    });
    return labels;
  }, [filterCategories]);

  const getCategoryLabel = (category: string | undefined) =>
    categoryLabels[category || ""] || category || "ไม่ระบุ";

  // Filter by search
  const filteredDocumentTypes = useMemo(() => {
    if (!searchTerm.trim()) return documentTypes;
    const term = searchTerm.trim().toLowerCase();
    return documentTypes
      .map((dt) => ({
        ...dt,
        templates: (dt.templates || []).filter(
          (t) =>
            t.name.toLowerCase().includes(term) ||
            (t.description && t.description.toLowerCase().includes(term)) ||
            dt.name.toLowerCase().includes(term)
        ),
      }))
      .filter((dt) => dt.templates.length > 0);
  }, [documentTypes, searchTerm]);

  const filteredOrphans = useMemo(() => {
    if (!searchTerm.trim()) return orphanTemplates;
    const term = searchTerm.trim().toLowerCase();
    return orphanTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
    );
  }, [orphanTemplates, searchTerm]);

  const totalTemplates = documentTypes.reduce((sum, dt) => sum + (dt.templates?.length || 0), 0) + orphanTemplates.length;

  // Auto-select first template
  useEffect(() => {
    if (selectedTemplate) return;
    const firstDt = filteredDocumentTypes[0];
    if (firstDt?.templates?.[0]) {
      setSelectedTemplate(firstDt.templates[0]);
    } else if (filteredOrphans[0]) {
      setSelectedTemplate(filteredOrphans[0]);
    }
  }, [filteredDocumentTypes, filteredOrphans, selectedTemplate]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (totalTemplates === 0) return <EmptyState />;

  const thumbnailUrl = selectedTemplate ? apiClient.getHDThumbnailUrl(selectedTemplate.id, 1200) : null;

  return (
    <div className="max-w-[1080px] mx-auto px-[8px]">
      {/* Split layout */}
      <div className="flex gap-[24px]">
        {/* Left Panel - Document List (1/4) */}
        <div className="w-[260px] flex-shrink-0">
          {/* Sticky search — sticks at navbar bottom (112px) */}
          <div className="sticky top-[112px] z-10 bg-white pt-[20px] pb-[12px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b3b3b3]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาเอกสาร..."
                className="w-full h-[31px] pl-10 pr-8 border-[0.5px] border-[#b3b3b3] rounded text-[14px] font-medium text-black placeholder:text-[#b3b3b3] focus:outline-none focus:border-[#013087] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Document groups */}
          <div className="space-y-2">
            {filteredDocumentTypes.map((docType) => (
              <div key={docType.id}>
                {/* Sticky group header — sticks below search (112 + 63 = 175px) */}
                <div className="sticky top-[175px] z-[5] bg-white py-[8px] scroll-mt-[175px] border-b border-[#e6e6e6]">
                  <h3 className="text-[16px] font-semibold text-black">{docType.name}</h3>
                  <p className="text-[12px] text-[#4d4d4d] mt-[2px]">{docType.name}</p>
                </div>

                {/* Template Items */}
                <div className="space-y-[8px] pt-[8px]">
                  {(docType.templates || []).map((template) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      categoryLabel={getCategoryLabel(template.category)}
                      onSelect={() => setSelectedTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Orphan Templates */}
            {filteredOrphans.length > 0 && (
              <div>
                <div className="sticky top-[175px] z-[5] bg-white py-[8px] border-b border-[#e6e6e6]">
                  <h3 className="text-[16px] font-semibold text-black">อื่นๆ</h3>
                  <p className="text-[12px] text-[#4d4d4d] mt-[2px]">เอกสารที่ไม่ได้จัดกลุ่ม</p>
                </div>
                <div className="space-y-[8px] pt-[8px]">
                  {filteredOrphans.map((template) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      categoryLabel={getCategoryLabel(template.category)}
                      onSelect={() => setSelectedTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {filteredDocumentTypes.length === 0 && filteredOrphans.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-[#4d4d4d]">
                  ไม่พบเอกสารที่ตรงกับ &ldquo;{searchTerm}&rdquo;
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-xs text-[#013087] hover:text-[#013087]/80 font-medium"
                >
                  ล้างการค้นหา
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview (3/4), sticky below search */}
        <div className="flex-1 sticky top-[132px] self-start h-[calc(100vh-132px-24px)] mt-[20px] rounded-xl border border-[#e6e6e6] overflow-hidden bg-white flex flex-col">
          {/* รายละเอียด Header — fixed at top of panel */}
          <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e6e6e6] flex-shrink-0">
            <div>
              <h2 className="text-[18px] font-semibold text-black">รายละเอียด</h2>
              <p className="text-[14px] text-[#4d4d4d]">ตัวอย่างและรายละเอียดเกี่ยวกับเอกสาร</p>
            </div>
            {selectedTemplate && (
              <Link
                href={`/forms/${selectedTemplate.id}/fill`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#013087] text-white text-[14px] font-medium rounded-lg hover:bg-[#013087]/90 transition-colors"
              >
                กรอกฟอร์ม
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Preview Image - scrollable area */}
          <div className="flex-1 overflow-y-auto p-[24px] bg-[#fafafa]">
            {selectedTemplate ? (
              <div className="bg-white rounded-lg border border-[#e6e6e6] overflow-hidden shadow-sm">
                {thumbnailUrl && !imgError ? (
                  <img
                    src={thumbnailUrl}
                    alt={selectedTemplate.name}
                    className="w-full h-auto object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <span className="text-6xl font-bold text-gray-200">
                      {selectedTemplate.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-[14px] text-[#b3b3b3]">เลือกเอกสารเพื่อดูตัวอย่าง</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
