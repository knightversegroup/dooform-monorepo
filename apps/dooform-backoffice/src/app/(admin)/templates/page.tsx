"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Search,
    ChevronDown,
    ChevronUp,
    Loader2,
    FolderOpen,
    Eye,
    Pencil,
    Trash2,
    Plus,
    AlignLeft,
    ArrowDownZA,
    AlarmClock,
    TableOfContents,
    TriangleAlert,
    CaseSensitive,
    Box,
    BadgePlus,
    UserPen,
    Bot,
    BellRing,
    FolderLock,
    Lightbulb,
    Download,
} from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import { Template, DocumentType } from "@dooform/shared/api/types";

const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }) + " น.";
    } catch {
        return dateString;
    }
};

// Template card — collapsed / expanded
function TemplateCard({
    template,
    isSelected,
    isExpanded,
    onSelect,
    onToggleExpand,
    onDelete,
}: {
    template: Template;
    isSelected: boolean;
    isExpanded: boolean;
    onSelect: () => void;
    onToggleExpand: () => void;
    onDelete: (id: string) => void;
}) {
    const pageCount = template.placeholders?.length || 0;

    return (
        <div
            className="cursor-pointer border border-[#e6e6e6] rounded-lg overflow-hidden"
            onClick={() => {
                onSelect();
                onToggleExpand();
            }}
        >
            {/* Top header */}
            <div className="flex items-center justify-between p-4 bg-white">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-[#4d4d4d] leading-snug">
                        {template.name}
                    </p>
                    <p className="text-xs text-[#808080]">
                        หมวดหมู่: {template.category || "ไม่ระบุ"}
                    </p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand();
                    }}
                    className="flex items-center gap-1 shrink-0"
                >
                    <span className="text-sm text-[#4d4d4d] whitespace-nowrap">
                        {pageCount} หน้า
                    </span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-[#4d4d4d] transition-transform ${
                            isExpanded ? "rotate-180" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Expanded section */}
            {isExpanded && (
                <div className="bg-[#fafafa] border-t border-[#e6e6e6] p-4 flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                        {template.updated_at && (
                            <div className="flex items-center gap-1.5">
                                <AlarmClock className="w-3.5 h-3.5 text-[#808080] shrink-0" />
                                <span className="text-xs text-[#808080]">
                                    แก้ไขล่าสุด: {formatDate(template.updated_at)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <TableOfContents className="w-3.5 h-3.5 text-[#808080] shrink-0" />
                            <span className="text-xs text-[#808080]">
                                หมวดหมู่: {template.category || "-"}
                            </span>
                        </div>
                        {template.remarks && (
                            <div className="flex items-center gap-1.5">
                                <TriangleAlert className="w-3.5 h-3.5 text-[#808080] shrink-0" />
                                <span className="text-xs text-[#808080]">
                                    หมายเหตุ: {template.remarks}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(template.id);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1 bg-white border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-3 h-3 text-red-500" />
                            <span className="text-xs font-medium text-red-500">
                                ลบ
                            </span>
                        </button>
                        <Link
                            href={`/templates/${template.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-1 px-3 py-1 bg-white border border-[#e6e6e6] rounded-full"
                        >
                            <Pencil className="w-3 h-3 text-[#4d4d4d]" />
                            <span className="text-xs font-medium text-[#4d4d4d]">
                                แก้ไขฟอร์ม
                            </span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// Document type group header + cards
function DocumentTypeGroup({
    documentType,
    templates,
    selectedTemplateId,
    expandedTemplateId,
    onSelectTemplate,
    onToggleExpand,
    onDeleteTemplate,
}: {
    documentType: DocumentType;
    templates: Template[];
    selectedTemplateId: string | null;
    expandedTemplateId: string | null;
    onSelectTemplate: (t: Template) => void;
    onToggleExpand: (id: string) => void;
    onDeleteTemplate: (id: string) => void;
}) {
    return (
        <div className="mb-6">
            <div className="mb-2">
                <p className="text-xl font-semibold leading-snug text-[#333]">
                    {documentType.name}
                </p>
                <p className="text-sm text-[#4d4d4d]">
                    {documentType.description || documentType.name}
                </p>
            </div>
            <div className="flex flex-col gap-2">
                {templates.map((template) => (
                    <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplateId === template.id}
                        isExpanded={expandedTemplateId === template.id}
                        onSelect={() => onSelectTemplate(template)}
                        onToggleExpand={() => onToggleExpand(template.id)}
                        onDelete={onDeleteTemplate}
                    />
                ))}
            </div>
        </div>
    );
}

// Detail table row
function DetailRow({
    icon: Icon,
    label,
    children,
    isLast,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
    isLast?: boolean;
}) {
    return (
        <div
            className={`flex gap-3 items-start px-4 py-2.5 w-full ${
                isLast ? "" : "border-b border-[#e6e6e6]"
            }`}
        >
            <div className="flex items-center gap-1.5 w-[120px] shrink-0">
                <Icon className="w-4 h-4 text-[#4d4d4d] shrink-0" />
                <span className="text-sm font-medium text-[#4d4d4d] whitespace-nowrap">
                    {label}
                </span>
            </div>
            <div className="flex-1 min-w-0 text-sm text-[#4d4d4d]">
                {children}
            </div>
        </div>
    );
}

export default function TemplatesPage() {
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [orphanTemplates, setOrphanTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
    const [tipsExpanded, setTipsExpanded] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.getTemplatesGrouped();
                setDocumentTypes(response.document_types || []);
                setOrphanTemplates(response.orphan_templates || []);

                const firstDt = (response.document_types || [])[0];
                const firstTemplate =
                    firstDt?.templates?.[0] || (response.orphan_templates || [])[0];
                if (firstTemplate) {
                    setSelectedTemplate(firstTemplate);
                }
            } catch (err) {
                console.error("Failed to load data:", err);
                setError(err instanceof Error ? err.message : "Failed to load templates");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleToggleExpand = (id: string) => {
        setExpandedTemplateId((prev) => (prev === id ? null : id));
    };

    const handleSelectTemplate = (template: Template) => {
        setSelectedTemplate(template);
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm("ต้องการลบเทมเพลตนี้หรือไม่?")) return;
        try {
            setDeletingId(templateId);
            await apiClient.deleteTemplate(templateId);
            // Remove from document types
            setDocumentTypes((prev) =>
                prev.map((dt) => ({
                    ...dt,
                    templates: (dt.templates || []).filter((t) => t.id !== templateId),
                }))
            );
            // Remove from orphan templates
            setOrphanTemplates((prev) => prev.filter((t) => t.id !== templateId));
            // Clear selection if the deleted template was selected
            if (selectedTemplate?.id === templateId) {
                setSelectedTemplate(null);
            }
        } catch (err) {
            console.error("Failed to delete template:", err);
            alert(`ลบเทมเพลตไม่สำเร็จ: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setDeletingId(null);
        }
    };

    const filterTemplates = (templates: Template[]) => {
        if (!searchQuery) return templates;
        const q = searchQuery.toLowerCase();
        return templates.filter(
            (t) =>
                t.name?.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.category?.toLowerCase().includes(q) ||
                t.author?.toLowerCase().includes(q)
        );
    };

    const filteredDocumentTypes = documentTypes
        .map((dt) => ({ ...dt, templates: filterTemplates(dt.templates || []) }))
        .filter((dt) => {
            if (dt.templates.length > 0) return true;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    dt.name.toLowerCase().includes(q) ||
                    (dt.name_en || "").toLowerCase().includes(q)
                );
            }
            return false;
        });

    const filteredOrphans = filterTemplates(orphanTemplates);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#007398] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] text-center py-24">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-[#007398] hover:underline"
                >
                    ลองใหม่อีกครั้ง
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-[#4d4d4d]">
                        แบบฟอร์มทั้งหมด
                    </h1>
                    <p className="text-base text-[#4d4d4d] mt-1">
                        รายการแบบฟอร์มทั้งหมด
                    </p>
                </div>
                <Link
                    href="/templates/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#007398] text-white rounded-lg text-sm font-medium hover:bg-[#005f7a] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    อัปโหลด Docx ใหม่
                </Link>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                    <div className="flex items-center bg-white border border-[#e6e6e6] rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-[#808080] mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="ค้นหาแบบฟอร์ม"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-sm text-[#4d4d4d] placeholder:text-[#808080] bg-transparent outline-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="flex items-center p-2 border border-[#e6e6e6] rounded-lg hover:bg-gray-50">
                        <AlignLeft className="w-5 h-5 text-[#4d4d4d]" />
                    </button>
                    <button className="flex items-center p-2 border border-[#e6e6e6] rounded-lg hover:bg-gray-50">
                        <ArrowDownZA className="w-5 h-5 text-[#4d4d4d]" />
                    </button>
                </div>
            </div>

            {/* 3-Column Layout */}
            <div className="flex gap-5">
                {/* Left Column — Template List */}
                <div className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
                    {filteredDocumentTypes.map((docType) => (
                        <DocumentTypeGroup
                            key={docType.id}
                            documentType={docType}
                            templates={docType.templates || []}
                            selectedTemplateId={selectedTemplate?.id || null}
                            expandedTemplateId={expandedTemplateId}
                            onSelectTemplate={handleSelectTemplate}
                            onToggleExpand={handleToggleExpand}
                            onDeleteTemplate={handleDeleteTemplate}
                        />
                    ))}

                    {filteredOrphans.length > 0 && (
                        <div className="mb-6">
                            <div className="mb-2">
                                <p className="text-xl font-semibold leading-snug text-[#333]">
                                    อื่นๆ
                                </p>
                                <p className="text-sm text-[#4d4d4d]">
                                    เทมเพลตที่ยังไม่ได้จัดกลุ่ม
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {filteredOrphans.map((template) => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        isSelected={selectedTemplate?.id === template.id}
                                        isExpanded={expandedTemplateId === template.id}
                                        onSelect={() => handleSelectTemplate(template)}
                                        onToggleExpand={() => handleToggleExpand(template.id)}
                                        onDelete={handleDeleteTemplate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredDocumentTypes.length === 0 && filteredOrphans.length === 0 && (
                        <div className="text-center py-12">
                            <FolderOpen className="w-8 h-8 text-[#ccc] mx-auto mb-2" />
                            <p className="text-sm text-[#808080]">
                                {searchQuery
                                    ? "ไม่พบแบบฟอร์มที่ตรงกับการค้นหา"
                                    : "ยังไม่มีแบบฟอร์ม"}
                            </p>
                        </div>
                    )}

                    {/* Fade-out overlay */}
                    <div
                        className="sticky bottom-0 h-16 pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 25%, #fff 50%, #fff 100%)",
                        }}
                    />
                </div>

                {/* Center Column — Preview */}
                <div className="flex-1 min-w-0">
                    <div className="mb-2">
                        <p className="text-xl font-semibold leading-snug text-[#4d4d4d]">
                            รายละเอียด
                        </p>
                        <p className="text-sm text-[#4d4d4d]">
                            ตัวอย่างและรายละเอียดเกี่ยวกับเอกสาร
                        </p>
                    </div>

                    {selectedTemplate ? (
                        <>
                            <div className="bg-white border border-[#e6e6e6] rounded-lg h-[496px] flex items-center justify-center p-4 mb-6">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={apiClient.getHDThumbnailUrl(selectedTemplate.id, 800)}
                                        alt={selectedTemplate.name}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="text-xl font-semibold leading-snug text-[#4d4d4d]">
                                    เอกสารต้นฉบับ
                                </p>
                                <p className="text-sm text-[#4d4d4d]">
                                    สามารถกดดาวน์โหลดเอกสารต้นฉบับได้จากกระทรวง
                                </p>
                                {selectedTemplate.original_source && (
                                    <a
                                        href={selectedTemplate.original_source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-2 text-sm text-[#007398] hover:underline"
                                    >
                                        <Download className="w-4 h-4" />
                                        ดาวน์โหลดต้นฉบับ
                                    </a>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white border border-[#e6e6e6] rounded-lg h-[496px] flex items-center justify-center p-4">
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[#4d4d4d]">
                                    ตัวอย่างเอกสาร
                                </p>
                                <p className="text-xs text-[#808080] mt-1">
                                    ตัวอย่างและคำอธิบายเกี่ยวกับเอกสารจะแสดงที่นี่
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column — Details */}
                <div className="flex-1 min-w-0">
                    {selectedTemplate ? (
                        <>
                            {/* Template Title */}
                            <div className="mb-3">
                                <p className="text-base font-semibold text-[#4d4d4d]">
                                    {selectedTemplate.name}
                                </p>
                            </div>

                            {/* Detail Table */}
                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-semibold text-[#4d4d4d]">
                                    ข้อมูลเกี่ยวกับเอกสาร
                                </p>

                                <div className="bg-white border border-[#e6e6e6] rounded-lg">
                                    <DetailRow icon={CaseSensitive} label="ชื่อเอกสาร">
                                        {selectedTemplate.name}
                                    </DetailRow>
                                    <DetailRow icon={Box} label="หมวดหมู่">
                                        {selectedTemplate.document_type
                                            ? `${selectedTemplate.document_type.category || ""} \u30FB ${selectedTemplate.category || ""}`
                                            : selectedTemplate.category || "-"}
                                    </DetailRow>
                                    <DetailRow icon={BadgePlus} label="วันที่สร้าง">
                                        {formatDate(selectedTemplate.created_at)}
                                    </DetailRow>
                                    <DetailRow icon={Pencil} label="วันที่แก้ไข">
                                        {formatDate(selectedTemplate.updated_at)}
                                    </DetailRow>
                                    <DetailRow icon={UserPen} label="สร้างโดย">
                                        <span className="flex items-center gap-1.5">
                                            {selectedTemplate.author ? (
                                                <>
                                                    <span className="w-3 h-3 bg-blue-400 rounded-full inline-block shrink-0" />
                                                    @{selectedTemplate.author}
                                                </>
                                            ) : (
                                                "-"
                                            )}
                                        </span>
                                    </DetailRow>
                                    <DetailRow icon={Bot} label="ผู้ช่วย">
                                        {selectedTemplate.is_ai_available ? "AI พร้อมใช้งาน" : "ไม่มี"}
                                    </DetailRow>
                                    <DetailRow icon={BellRing} label="สถานะ">
                                        <span className="text-[#005200]">
                                            {selectedTemplate.is_verified ? "ยืนยันแล้ว" : "ทดลองใช้งาน"}
                                        </span>
                                    </DetailRow>
                                    <DetailRow icon={FolderLock} label="ประเภท">
                                        {selectedTemplate.type === "official"
                                            ? "เอกสารภายใน"
                                            : selectedTemplate.type === "private"
                                            ? "เอกสารส่วนตัว"
                                            : selectedTemplate.type || "-"}
                                    </DetailRow>
                                    <DetailRow icon={TriangleAlert} label="หมายเหตุ" isLast>
                                        {selectedTemplate.remarks ? (
                                            <ul className="list-disc ml-5">
                                                {selectedTemplate.remarks.split("\n").map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "-"
                                        )}
                                    </DetailRow>
                                </div>
                            </div>

                            {/* Tips Section */}
                            <div className="flex flex-col gap-3 mt-6">
                                <p className="text-sm font-semibold text-[#4d4d4d]">
                                    คำแนะนำ
                                </p>
                                <div className="bg-white border border-[#e6e6e6] rounded-lg">
                                    <button
                                        onClick={() => setTipsExpanded(!tipsExpanded)}
                                        className="flex items-center justify-between w-full px-4 py-2.5 border-b border-[#e6e6e6]"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Lightbulb className="w-4 h-4 text-[#4d4d4d]" />
                                            <span className="text-sm font-medium text-[#4d4d4d]">
                                                คำแนะนำ
                                            </span>
                                        </div>
                                        {tipsExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-[#4d4d4d]" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-[#4d4d4d]" />
                                        )}
                                    </button>
                                    {tipsExpanded && (
                                        <div className="bg-[#fafafa] rounded-b-lg px-4 py-2.5">
                                            <ul className="list-disc ml-5 text-sm text-[#4d4d4d]">
                                                <li>สามารถเลือกแปลด้านใดด้านหนึ่งได้</li>
                                                {selectedTemplate.description && (
                                                    <li>{selectedTemplate.description}</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-[300px]">
                            <p className="text-sm text-[#808080]">
                                เลือกเอกสารเพื่อดูข้อมูล
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
