"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Calendar,
    User,
    CheckCircle,
    Sparkles,
    Globe,
    Building2,
    Users,
    Loader2,
    Download,
    Pencil,
    Eye,
    Lock,
    Unlock,
    FileText,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@dooform/shared/api/client";
import { Template } from "@dooform/shared/api/types";

const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TemplateDetailPage({ params }: PageProps) {
    const { id: templateId } = use(params);
    const router = useRouter();
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllFields, setShowAllFields] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.getAllTemplates();
                const foundTemplate = response.templates?.find(
                    (t) => t.id === templateId
                );
                if (!foundTemplate) {
                    setError("ไม่พบเทมเพลตที่ต้องการ");
                    return;
                }
                setTemplate(foundTemplate);
            } catch (err) {
                console.error("Failed to load template:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load template"
                );
            } finally {
                setLoading(false);
            }
        };
        if (templateId) {
            loadTemplate();
        }
    }, [templateId]);

    const handleDeleteTemplate = async () => {
        if (!template) return;
        const confirmMessage = `คุณต้องการลบ "${template.name}" หรือไม่?\n\nการลบนี้จะไม่สามารถกู้คืนได้`;
        if (!confirm(confirmMessage)) return;
        try {
            setDeleting(true);
            await apiClient.deleteTemplate(templateId);
            router.push("/templates");
        } catch (err) {
            console.error("Failed to delete template:", err);
            alert(err instanceof Error ? err.message : "ไม่สามารถลบเทมเพลตได้");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#007398] animate-spin" />
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-[400px] text-center py-24">
                <h1 className="text-2xl text-gray-900 mb-4">
                    {error || "ไม่พบเทมเพลต"}
                </h1>
                <Link
                    href="/templates"
                    className="inline-flex items-center text-[#007398] hover:underline"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับไปหน้ารายการเทมเพลต
                </Link>
            </div>
        );
    }

    const placeholders = template.placeholders || [];
    const aliases = template.aliases || {};
    const displayedFields = showAllFields ? placeholders : placeholders.slice(0, 8);

    return (
        <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8">
                <Link href="/templates" className="text-[#007398] hover:underline">เทมเพลต</Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{template.name}</span>
            </nav>

            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-medium text-gray-900 mb-4">
                        {template.name}
                    </h1>

                    {template.description && (
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            {template.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{placeholders.length} ช่องกรอก</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {template.tier === "free" ? (
                                <Unlock className="w-4 h-4 text-green-600" />
                            ) : (
                                <Lock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="capitalize">{template.tier || "Free"}</span>
                        </div>
                        {template.is_verified && (
                            <div className="flex items-center gap-1.5 text-blue-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>ยืนยันแล้ว</span>
                            </div>
                        )}
                        {template.is_ai_available && (
                            <div className="flex items-center gap-1.5 text-purple-600">
                                <Sparkles className="w-4 h-4" />
                                <span>รองรับ AI</span>
                            </div>
                        )}
                    </div>

                    {/* Admin Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/templates/${templateId}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#007398] text-white text-sm font-medium rounded hover:bg-[#005f7a] transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                            แก้ไขเทมเพลต
                        </Link>
                        <button
                            onClick={handleDeleteTemplate}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            {deleting ? "กำลังลบ..." : "ลบเทมเพลต"}
                        </button>
                    </div>
                </div>

                {/* Preview Image */}
                <div>
                    <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                            src={apiClient.getHDThumbnailUrl(templateId, 800)}
                            alt={template.name}
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            </div>

            {/* Template Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลเทมเพลต</h3>
                    <dl className="space-y-3 text-sm">
                        {template.author && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{template.author}</span>
                            </div>
                        )}
                        {template.created_at && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{formatDate(template.created_at)}</span>
                            </div>
                        )}
                        {template.file_size && template.file_size > 0 && (
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{formatFileSize(template.file_size)}</span>
                            </div>
                        )}
                        {template.type && (
                            <div className="flex items-center gap-2">
                                {template.type === "official" ? (
                                    <Globe className="w-4 h-4 text-gray-400" />
                                ) : template.type === "private" ? (
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <Users className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-600 capitalize">{template.type}</span>
                            </div>
                        )}
                        {template.category && (
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 capitalize">{template.category}</span>
                            </div>
                        )}
                        {template.original_source && (
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{template.original_source}</span>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Fields */}
                {placeholders.length > 0 && (
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            ช่องกรอกข้อมูล ({placeholders.length} รายการ)
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {displayedFields.map((field, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1.5 rounded text-sm bg-gray-100 text-gray-700 border border-gray-200"
                                >
                                    {aliases[field] || field.replace(/[{}]/g, "")}
                                </span>
                            ))}
                            {placeholders.length > 8 && !showAllFields && (
                                <button
                                    onClick={() => setShowAllFields(true)}
                                    className="inline-flex items-center px-3 py-1.5 rounded text-sm bg-[#007398]/10 text-[#007398] hover:bg-[#007398]/20 transition-colors"
                                >
                                    +{placeholders.length - 8} อื่นๆ
                                </button>
                            )}
                        </div>
                        {showAllFields && placeholders.length > 8 && (
                            <button
                                onClick={() => setShowAllFields(false)}
                                className="text-sm text-[#007398] hover:underline"
                            >
                                แสดงน้อยลง
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Back Link */}
            <Link
                href="/templates"
                className="inline-flex items-center text-[#007398] hover:underline"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับไปหน้ารายการเทมเพลต
            </Link>
        </div>
    );
}
