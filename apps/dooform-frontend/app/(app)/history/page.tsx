"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Download,
    FileText,
    Eye,
    X,
    Loader2,
    RefreshCw,
    Search,
    ArrowDownAZ,
    ArrowUpZA,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
} from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import { useAuth } from "@dooform/shared/auth/hooks";
import { Button, LogoLoaderInline } from "@dooform/shared";

interface DocumentHistory {
    id: string;
    template_id: string;
    user_id: string;
    filename: string;
    gcs_path_docx: string;
    gcs_path_pdf: string;
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

const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const cleanDateString = dateString.replace("Z", "");
    const date = new Date(cleanDateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return formatDate(dateString);
};

function StatusBadge({ doc }: { doc: DocumentHistory }) {
    const hasFiles = doc.gcs_path_docx || doc.gcs_path_pdf;
    return (
        <div className="flex items-center gap-1 text-[14px] font-medium text-black">
            <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    hasFiles ? "bg-[#22c55e]" : "bg-[#eab308]"
                }`}
            />
            <span>{hasFiles ? "พร้อมดาวน์โหลด" : "ต้องสร้างใหม่"}</span>
        </div>
    );
}

export default function HistoryPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [documents, setDocuments] = useState<DocumentHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?redirect=/history");
        }
    }, [authLoading, isAuthenticated, router]);

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<HistoryResponse>(
                `/api/v1/documents/history?page=${page}&limit=${limit}`
            );
            setDocuments(response.data.documents || []);
            setTotalPages(response.data.pagination?.pages || 1);
            setTotal(response.data.pagination?.total || 0);
        } catch (err) {
            console.error("Failed to load history:", err);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            loadHistory();
        }
    }, [authLoading, isAuthenticated, loadHistory]);

    const filteredDocuments = useMemo(() => {
        let filtered = documents;
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(
                (doc) =>
                    doc.filename.toLowerCase().includes(term) ||
                    (doc.template?.name &&
                        doc.template.name.toLowerCase().includes(term))
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            const cmp =
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime();
            return sortDirection === "asc" ? cmp : -cmp;
        });

        return sorted;
    }, [documents, searchTerm, sortDirection]);

    const handleDownload = async (
        doc: DocumentHistory,
        format: "docx" | "pdf"
    ) => {
        try {
            setDownloading(`${doc.id}-${format}`);
            const blob = await apiClient.downloadDocument(doc.id, format);
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement("a");
            a.href = url;
            const extension = format === "pdf" ? ".pdf" : ".docx";
            const baseName = doc.filename.replace(/\.(docx|pdf)$/i, "");
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
            await loadHistory();
        } finally {
            setDownloading(null);
        }
    };

    const handleRegenerate = async (doc: DocumentHistory) => {
        try {
            setRegenerating(doc.id);
            await apiClient.regenerateDocument(doc.id);
            await loadHistory();
        } catch (err) {
            console.error("Failed to regenerate:", err);
            alert("ไม่สามารถสร้างเอกสารใหม่ได้ กรุณาลองอีกครั้ง");
        } finally {
            setRegenerating(null);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LogoLoaderInline size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-[1080px] mx-auto px-[8px] py-8 flex flex-col gap-[32px]">
                {/* Header Section */}
                <section className="sticky top-[112px] z-10 bg-white flex flex-col gap-[20px] pt-[20px] pb-[12px]">
                    <div>
                        <h2 className="text-[24px] font-semibold text-black">
                            ประวัติเอกสาร
                        </h2>
                        <p className="text-[16px] font-normal text-black mt-[2px]">
                            {total > 0
                                ? `ดูประวัติการสร้างเอกสารและดาวน์โหลดไฟล์ (${total} เอกสาร)`
                                : "ดูประวัติการสร้างเอกสารและดาวน์โหลดไฟล์"}
                        </p>
                    </div>

                    {/* Search + Sort */}
                    <div className="flex items-center gap-[4px]">
                        <div className="relative w-[567px]">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ค้นหาเอกสาร..."
                                className="w-full h-[31px] pl-3 pr-8 border-[0.5px] border-[#b3b3b3] rounded text-[14px] font-medium text-black placeholder:text-[#b3b3b3] focus:outline-none focus:border-[#013087] transition-colors"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b3b3b3]" />
                        </div>

                        <button
                            onClick={() =>
                                setSortDirection((d) =>
                                    d === "asc" ? "desc" : "asc"
                                )
                            }
                            className="w-[31px] h-[31px] flex items-center justify-center border-[0.5px] border-[#b3b3b3] rounded hover:bg-gray-50 transition-colors"
                            title={
                                sortDirection === "asc"
                                    ? "เรียงเก่าสุด-ใหม่สุด"
                                    : "เรียงใหม่สุด-เก่าสุด"
                            }
                        >
                            {sortDirection === "asc" ? (
                                <ArrowDownAZ className="w-[18px] h-[18px] text-[#4d4d4d]" />
                            ) : (
                                <ArrowUpZA className="w-[18px] h-[18px] text-[#4d4d4d]" />
                            )}
                        </button>
                    </div>
                </section>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <LogoLoaderInline size="lg" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-900 font-medium">
                            ยังไม่มีเอกสาร
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            เอกสารที่คุณสร้างจะแสดงที่นี่
                        </p>
                        <Button
                            href="/forms"
                            variant="primary"
                            className="mt-4"
                        >
                            เริ่มสร้างเอกสาร
                        </Button>
                    </div>
                ) : searchTerm.trim() && filteredDocuments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-900 font-medium">
                            ไม่พบเอกสารที่ตรงกับ &ldquo;{searchTerm}&rdquo;
                        </p>
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-3 inline-flex items-center gap-1 text-sm text-[#013087] hover:text-[#013087]/80 font-medium"
                        >
                            <X className="w-4 h-4" />
                            ล้างการค้นหา
                        </button>
                    </div>
                ) : (
                    <section>
                        {/* Table Header */}
                        <div className="flex items-center gap-[20px] border-b border-[#e6e6e6] py-[10px] text-[14px] font-medium text-[#4d4d4d]">
                            <div className="w-[300px] flex-shrink-0">
                                เอกสาร
                            </div>
                            <div className="w-[180px] flex-shrink-0">
                                เทมเพลต
                            </div>
                            <div className="w-[180px] flex-shrink-0">
                                วันที่สร้าง
                            </div>
                            <div className="w-[140px] flex-shrink-0">
                                สถานะ
                            </div>
                            <div className="flex-1" />
                        </div>

                        {/* Document Rows */}
                        {filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-[20px] py-[16px] border-b border-[#e6e6e6]"
                            >
                                {/* Filename */}
                                <div className="w-[300px] flex-shrink-0 min-w-0">
                                    <p className="font-medium text-black truncate">
                                        {doc.filename}
                                    </p>
                                    <p className="text-[14px] text-[#666] truncate font-mono">
                                        {doc.id.slice(0, 8)}...
                                    </p>
                                </div>

                                {/* Template */}
                                <div className="w-[180px] flex-shrink-0 text-[14px] font-medium text-black truncate">
                                    {doc.template?.name || "ไม่ทราบเทมเพลต"}
                                </div>

                                {/* Created Date */}
                                <div className="w-[180px] flex-shrink-0 text-[14px] font-medium text-black">
                                    <p>{formatRelativeTime(doc.created_at)}</p>
                                    <p className="text-[12px] text-[#999]">
                                        {formatDate(doc.created_at)}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="w-[140px] flex-shrink-0">
                                    <StatusBadge doc={doc} />
                                </div>

                                {/* Actions */}
                                <div className="flex-1 flex items-center justify-end gap-2">
                                    <Link
                                        href={`/history/${doc.id}`}
                                        className="inline-flex items-center gap-1 text-[14px] text-black underline hover:text-[#000091] transition-colors"
                                    >
                                        ดูข้อมูล
                                        <ArrowUpRight className="w-[18px] h-[18px]" />
                                    </Link>
                                    {!doc.gcs_path_docx &&
                                    !doc.gcs_path_pdf ? (
                                        <button
                                            onClick={() =>
                                                handleRegenerate(doc)
                                            }
                                            disabled={
                                                regenerating === doc.id
                                            }
                                            className="inline-flex items-center gap-1 text-[14px] text-[#013087] underline hover:text-[#013087]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {regenerating === doc.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-[16px] h-[16px]" />
                                                    สร้างใหม่
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <>
                                            {doc.gcs_path_docx && (
                                                <button
                                                    onClick={() =>
                                                        handleDownload(
                                                            doc,
                                                            "docx"
                                                        )
                                                    }
                                                    disabled={
                                                        downloading ===
                                                        `${doc.id}-docx`
                                                    }
                                                    className="inline-flex items-center gap-1 text-[14px] text-black underline hover:text-[#000091] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {downloading ===
                                                    `${doc.id}-docx` ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Download className="w-[16px] h-[16px]" />
                                                            DOCX
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {doc.gcs_path_pdf && (
                                                <button
                                                    onClick={() =>
                                                        handleDownload(
                                                            doc,
                                                            "pdf"
                                                        )
                                                    }
                                                    disabled={
                                                        downloading ===
                                                        `${doc.id}-pdf`
                                                    }
                                                    className="inline-flex items-center gap-1 text-[14px] text-[#dc2626] underline hover:text-[#dc2626]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {downloading ===
                                                    `${doc.id}-pdf` ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Download className="w-[16px] h-[16px]" />
                                                            PDF
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#e6e6e6]">
                                <p className="text-[14px] text-[#4d4d4d]">
                                    หน้า {page} จาก {totalPages}
                                </p>
                                <div className="flex gap-[4px]">
                                    <button
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        disabled={page === 1}
                                        className="h-[31px] px-3 flex items-center gap-1 text-[14px] font-medium border-[0.5px] border-[#b3b3b3] rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-[18px] h-[18px]" />
                                        ก่อนหน้า
                                    </button>
                                    <button
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        disabled={page === totalPages}
                                        className="h-[31px] px-3 flex items-center gap-1 text-[14px] font-medium border-[0.5px] border-[#b3b3b3] rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ถัดไป
                                        <ChevronRight className="w-[18px] h-[18px]" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
