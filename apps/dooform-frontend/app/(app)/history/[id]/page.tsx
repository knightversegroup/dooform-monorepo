"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Download,
    Eye,
    FileText,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useAuth } from "@dooform/shared/auth/hooks";
import { apiClient } from "@dooform/shared/api/client";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import { PdfEditor } from "@/components/pdf-editor";
import { useTemplateLoader } from "@/app/(app)/forms/[id]/fill/hooks/useTemplateLoader";
import { usePreviewRenderer } from "@/app/(app)/forms/[id]/fill/hooks/usePreviewRenderer";
import { ReviewFields } from "@/app/(app)/forms/[id]/fill/components/ReviewFields";
import { LogoLoaderInline } from "@dooform/shared";

interface DocumentHistory {
    id: string;
    template_id: string;
    user_id: string;
    filename: string;
    file_path_docx: string;
    file_path_pdf: string;
    file_size: number;
    mime_type: string;
    data: string;
    status: string;
    created_at: string;
    updated_at: string;
    template?: {
        id: string;
        name: string;
        description: string;
        placeholders: string[];
        aliases: Record<string, string>;
    };
}

interface HistoryResponse {
    documents: DocumentHistory[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const formatDate = (dateString: string) => {
    const cleanDateString = dateString.replace("Z", "");
    const date = new Date(cleanDateString);
    return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function HistoryDetailPage({ params }: PageProps) {
    const { id: documentId } = use(params);
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [document, setDocument] = useState<DocumentHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [showPdfEditor, setShowPdfEditor] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loadingPdfEditor, setLoadingPdfEditor] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?redirect=/history/${documentId}`);
        }
    }, [authLoading, isAuthenticated, router, documentId]);

    // Load document from history
    useEffect(() => {
        if (authLoading || !isAuthenticated) return;

        const loadDocument = async () => {
            try {
                setLoading(true);
                // Fetch history and find the specific document
                const response = await apiClient.get<HistoryResponse>(
                    `/api/v1/documents/history?page=1&limit=100`
                );
                const doc = response.data.documents?.find(
                    (d) => d.id === documentId
                );
                if (doc) {
                    setDocument(doc);
                } else {
                    setError("ไม่พบเอกสาร");
                }
            } catch (err) {
                console.error("Failed to load document:", err);
                setError("ไม่สามารถโหลดข้อมูลเอกสารได้");
            } finally {
                setLoading(false);
            }
        };

        loadDocument();
    }, [authLoading, isAuthenticated, documentId]);

    // Load template field definitions once we have the document
    const templateId = document?.template_id || "";
    const {
        template,
        fieldDefinitions,
        groupedSections,
        htmlContent,
        hasPreview: templateHasPreview,
        loading: templateLoading,
        aliases: templateAliases,
    } = useTemplateLoader(templateId);

    // Parse saved form data and map to formData format (strip {{ }})
    const formData = useMemo(() => {
        if (!document?.data) return {};
        try {
            const parsed = JSON.parse(document.data);
            const mapped: Record<string, string> = {};
            Object.entries(parsed).forEach(([key, value]) => {
                const cleanKey = key.replace(/\{\{|\}\}/g, "");
                mapped[cleanKey] = value as string;
            });
            return mapped;
        } catch {
            return {};
        }
    }, [document?.data]);

    // Merge aliases from document template and loaded template
    const aliases = useMemo(() => {
        return { ...templateAliases, ...(document?.template?.aliases || {}) };
    }, [templateAliases, document?.template?.aliases]);

    // Preview rendering
    const { previewHtml, hasPreview } = usePreviewRenderer(
        htmlContent,
        formData,
        fieldDefinitions,
        groupedSections,
        null
    );

    const handleDownload = async (format: "docx" | "pdf") => {
        if (!document) return;
        try {
            setDownloading(format);
            const blob = await apiClient.downloadDocument(document.id, format);
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement("a");
            a.href = url;
            const extension = format === "pdf" ? ".pdf" : ".docx";
            const baseName = document.filename.replace(/\.(docx|pdf)$/i, "");
            a.download = `${baseName}${extension}`;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to download:", err);
            alert(
                "ไม่สามารถดาวน์โหลดไฟล์ได้ ไฟล์อาจหมดอายุแล้ว กรุณากด 'สร้างใหม่' เพื่อสร้างเอกสารอีกครั้ง"
            );
        } finally {
            setDownloading(null);
        }
    };

    const handleOpenPdfEditor = async () => {
        if (!document) return;
        try {
            setLoadingPdfEditor(true);
            const blob = await apiClient.downloadDocument(document.id, "pdf");
            setPdfBlob(blob);
            setShowPdfEditor(true);
        } catch (err) {
            console.error("Failed to load PDF for editing:", err);
            alert("ไม่สามารถโหลดไฟล์ PDF ได้");
        } finally {
            setLoadingPdfEditor(false);
        }
    };

    const handleRegenerate = async () => {
        if (!document) return;
        try {
            setRegenerating(true);
            await apiClient.regenerateDocument(document.id);
            // Reload the page to get updated data
            window.location.reload();
        } catch (err) {
            console.error("Failed to regenerate:", err);
            alert("ไม่สามารถสร้างเอกสารใหม่ได้ กรุณาลองอีกครั้ง");
        } finally {
            setRegenerating(false);
        }
    };

    // Loading states
    if (authLoading || (!isAuthenticated && !authLoading)) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LogoLoaderInline size="lg" />
            </div>
        );
    }

    if (loading || templateLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LogoLoaderInline size="lg" />
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-2xl font-light text-gray-900 mb-4">
                        {error || "ไม่พบเอกสาร"}
                    </h1>
                    <Link
                        href="/history"
                        className="inline-flex items-center text-[#013087] hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับไปหน้าประวัติ
                    </Link>
                </div>
            </div>
        );
    }

    const hasFiles = document.file_path_docx || document.file_path_pdf;

    return (
        <div className="min-h-screen bg-white">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
                    <Link
                        href="/history"
                        className="text-sm text-gray-600 hover:text-[#0b4db7]"
                    >
                        ← กลับไปหน้าประวัติ
                    </Link>
                    <div className="text-sm text-[#999]">
                        {formatDate(document.created_at)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={(hasPreview || showPdfEditor) ? "flex gap-6" : ""}>
                    {/* Form Card */}
                    <div
                        className={`bg-[#f6f6f6] flex flex-col gap-8 items-start p-8 rounded-lg ${
                            (hasPreview || showPdfEditor)
                                ? "w-1/3 flex-shrink-0"
                                : "w-full max-w-xl mx-auto"
                        }`}
                    >
                        {/* Header */}
                        <div className="border-b border-[#d9d9d9] flex flex-col gap-[10px] items-start justify-center p-4 w-full">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#013087]" />
                                <div className="flex flex-col gap-[2px]">
                                    <p className="text-[#171717] text-sm">
                                        ประวัติเอกสาร
                                    </p>
                                    <p className="font-semibold text-xl text-black">
                                        {document.template?.name ||
                                            document.filename}
                                    </p>
                                </div>
                            </div>
                            {/* Document info bar */}
                            <div className="flex items-center gap-4 text-[13px] text-[#999]">
                                <span>{document.filename}</span>
                                <span>|</span>
                                <span className="font-mono">
                                    {document.id.slice(0, 8)}
                                </span>
                                <span>|</span>
                                <span className="flex items-center gap-1">
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            hasFiles
                                                ? "bg-[#22c55e]"
                                                : "bg-[#eab308]"
                                        }`}
                                    />
                                    {hasFiles
                                        ? "พร้อมดาวน์โหลด"
                                        : "ต้องสร้างใหม่"}
                                </span>
                            </div>
                        </div>

                        {/* Review Fields (disabled form data) */}
                        {groupedSections.length > 0 ||
                        Object.keys(fieldDefinitions).length > 0 ? (
                            <ReviewFields
                                groupedSections={groupedSections}
                                fieldDefinitions={fieldDefinitions}
                                formData={formData}
                                aliases={aliases}
                            />
                        ) : (
                            // Fallback: show raw form data if template can't be loaded
                            <div className="flex flex-col items-start w-full">
                                <div className="flex flex-col items-start justify-center px-4 py-2 w-full">
                                    <div className="flex flex-col gap-4 items-start w-full">
                                        {Object.entries(formData).map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex flex-col gap-2 items-start w-full"
                                                >
                                                    <p className="font-semibold text-[#171717] text-base">
                                                        {aliases[key] ||
                                                            aliases[
                                                                `{{${key}}}`
                                                            ] ||
                                                            key}
                                                    </p>
                                                    <div className="flex items-start w-full">
                                                        <div className="bg-[#f0f0f0] border-b-2 border-[#5b5b5b] border-l-0 border-r-0 border-t-0 px-4 py-[13px] text-base text-[#171717] w-full min-h-[48px]">
                                                            {value || "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 px-4 w-full">
                            {!hasFiles ? (
                                <button
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#013087] text-white rounded hover:bg-[#013087]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {regenerating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-5 h-5" />
                                    )}
                                    สร้างเอกสารใหม่
                                </button>
                            ) : (
                                <>
                                    {document.file_path_docx && (
                                        <button
                                            onClick={() =>
                                                handleDownload("docx")
                                            }
                                            disabled={
                                                downloading === "docx"
                                            }
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#013087] text-white rounded hover:bg-[#013087]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {downloading === "docx" ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Download className="w-5 h-5" />
                                            )}
                                            ดาวน์โหลด DOCX
                                        </button>
                                    )}
                                    {document.file_path_pdf && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleDownload("pdf")
                                                }
                                                disabled={
                                                    downloading === "pdf"
                                                }
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-[#013087] text-[#013087] rounded hover:bg-[#013087]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {downloading === "pdf" ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Download className="w-5 h-5" />
                                                )}
                                                ดาวน์โหลด PDF
                                            </button>
                                            <button
                                                onClick={handleOpenPdfEditor}
                                                disabled={loadingPdfEditor}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-[#013087] text-[#013087] rounded hover:bg-[#013087]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loadingPdfEditor ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <FileText className="w-5 h-5" />
                                                )}
                                                แก้ไข PDF
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: PDF Editor or Document Preview */}
                    {showPdfEditor && pdfBlob ? (
                        <div className="w-2/3 hidden lg:block">
                            <div className="sticky top-4">
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            แก้ไข PDF
                                        </h3>
                                        <button
                                            onClick={() => setShowPdfEditor(false)}
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            ← กลับไปดูตัวอย่าง
                                        </button>
                                    </div>
                                    <PdfEditor
                                        pdfBlob={pdfBlob}
                                        fileName={`${document.filename.replace(/\.(docx|pdf)$/i, "")}.pdf`}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : hasPreview ? (
                        <div className="w-2/3 hidden lg:block">
                            <div className="sticky top-4">
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                            <Eye
                                                className="w-4 h-4 text-gray-400"
                                                aria-hidden="true"
                                            />
                                            ตัวอย่างเอกสาร
                                        </h3>
                                    </div>
                                    <div className="h-[calc(100vh-14rem)] overflow-auto">
                                        <DocumentPreview
                                            htmlContent={previewHtml}
                                            showHeader={false}
                                            orientation={
                                                template?.page_orientation ||
                                                "auto"
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
