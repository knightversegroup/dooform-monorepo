"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, ChevronDown, ChevronUp, CheckCircle, Sparkles, Globe, Building2, Users, Loader2, Plus, FolderOpen, ChevronRight, Settings } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Template, TemplateType, Tier, DocumentType } from "@/lib/api/types";

// Types
interface FilterSection {
    id: string;
    title: string;
    options: string[];
    expanded?: boolean;
}

// Helper to parse placeholders
const parsePlaceholders = (placeholdersJson: string): string[] => {
    try {
        return JSON.parse(placeholdersJson || '[]');
    } catch {
        return [];
    }
};

// Filter Checkbox Component
function FilterCheckbox({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only"
            />
            <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    checked
                        ? "bg-primary border-primary"
                        : "border-border-default group-hover:border-primary"
                }`}
            >
                {checked && (
                    <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </div>
            <span className="text-body-sm text-text-default">{label}</span>
        </label>
    );
}

// Filter Section Component
function FilterSectionComponent({
    section,
    selectedFilters,
    onFilterChange,
}: {
    section: FilterSection;
    selectedFilters: string[];
    onFilterChange: (option: string) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const initialShow = 4;
    const [showAll, setShowAll] = useState(false);

    const visibleOptions = showAll
        ? section.options
        : section.options.slice(0, initialShow);
    const hasMore = section.options.length > initialShow;

    return (
        <div className="border-b border-border-default pb-4 mb-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full mb-3"
            >
                <span className="text-body font-semibold text-foreground">
                    {section.title}
                </span>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
            </button>

            {expanded && (
                <div className="space-y-3 pl-1">
                    {visibleOptions.map((option) => (
                        <FilterCheckbox
                            key={option}
                            label={option}
                            checked={selectedFilters.includes(option)}
                            onChange={() => onFilterChange(option)}
                        />
                    ))}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-body-sm text-primary hover:underline"
                        >
                            {showAll
                                ? "แสดงน้อยลง"
                                : `ดูเพิ่มเติม (${section.options.length - initialShow})`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Get type icon and styling
function getTypeInfo(type: TemplateType) {
    switch (type) {
        case 'official':
            return { icon: Globe, label: 'Official', bgClass: 'bg-primary/10 text-primary' };
        case 'private':
            return { icon: Building2, label: 'Private', bgClass: 'bg-surface-alt text-text-muted border border-border-default' };
        case 'community':
            return { icon: Users, label: 'Community', bgClass: 'bg-surface-alt text-text-muted border border-border-default' };
        default:
            return { icon: Globe, label: type || 'Unknown', bgClass: 'bg-surface-alt text-text-muted border border-border-default' };
    }
}

// Get tier styling
function getTierClass(tier: Tier) {
    switch (tier) {
        case 'enterprise':
            return 'bg-primary text-white';
        case 'premium':
            return 'bg-primary/80 text-white';
        case 'basic':
            return 'bg-surface-alt text-text-default border border-border-default';
        case 'free':
        default:
            return 'bg-surface-alt text-text-muted border border-border-default';
    }
}

// Template Card Component
function TemplateCard({ template }: { template: Template }) {
    const placeholders = parsePlaceholders(template.placeholders);
    const typeInfo = getTypeInfo(template.type);
    const TypeIcon = typeInfo.icon;

    return (
        <Link
            href={`/forms/${template.id}`}
            className="block bg-background border border-border-default rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all"
        >
            <div className="space-y-3">
                {/* Title with badges */}
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-h4 text-foreground font-semibold leading-snug flex-1">
                        {template.display_name || template.name || template.filename}
                        {template.is_verified && (
                            <CheckCircle className="inline-block ml-2 h-4 w-4 text-blue-500" />
                        )}
                        {template.is_ai_available && (
                            <Sparkles className="inline-block ml-1 h-4 w-4 text-purple-500" />
                        )}
                    </h3>
                </div>

                {/* Description */}
                {template.description && (
                    <p className="text-body-sm text-text-muted line-clamp-2">
                        {template.description}
                    </p>
                )}

                {/* Tags/Badges */}
                <div className="flex flex-wrap gap-2">
                    {template.category && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium bg-primary/10 text-primary">
                            {template.category}
                        </span>
                    )}
                    {template.type && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium ${typeInfo.bgClass}`}>
                            <TypeIcon className="w-3 h-3" />
                            {typeInfo.label}
                        </span>
                    )}
                    {template.tier && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium ${getTierClass(template.tier)}`}>
                            {template.tier.charAt(0).toUpperCase() + template.tier.slice(1)}
                        </span>
                    )}
                </div>

                {/* Placeholders count */}
                {placeholders.length > 0 && (
                    <div className="text-body-sm text-text-muted">
                        {placeholders.length} ช่องกรอกข้อมูล
                    </div>
                )}

                {/* Author info */}
                {template.author && (
                    <div className="flex items-center gap-2 text-body-sm text-text-muted pt-2 border-t border-border-default">
                        <span>โดย {template.author}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

// Document Type Group Component
function DocumentTypeGroup({
    documentType,
    templates,
    expanded,
    onToggle,
}: {
    documentType: DocumentType;
    templates: Template[];
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border border-border-default rounded-lg overflow-hidden mb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 bg-surface-alt hover:bg-surface-alt/80 transition-colors"
            >
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: documentType.color || '#6B7280' }}
                />
                {expanded ? (
                    <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{documentType.name}</span>
                        {documentType.name_en && (
                            <span className="text-sm text-text-muted">({documentType.name_en})</span>
                        )}
                    </div>
                    {documentType.description && (
                        <p className="text-body-sm text-text-muted mt-0.5">{documentType.description}</p>
                    )}
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-full">
                    {templates.length} เทมเพลต
                </span>
            </button>
            {expanded && (
                <div className="p-4 space-y-3 bg-background">
                    {templates.map((template) => (
                        <Link
                            key={template.id}
                            href={`/forms/${template.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-alt transition-colors"
                        >
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                {template.variant_order + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground truncate">
                                        {template.display_name || template.filename}
                                    </span>
                                    {template.variant_name && (
                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded flex-shrink-0">
                                            {template.variant_name}
                                        </span>
                                    )}
                                    {template.is_verified && (
                                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    )}
                                </div>
                                {template.description && (
                                    <p className="text-body-sm text-text-muted truncate mt-0.5">
                                        {template.description}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// Main Component
export default function FormTemplateList() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [orphanTemplates, setOrphanTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode] = useState<'list' | 'grouped'>('grouped');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        category: [],
        type: [],
        tier: [],
    });

    // Load templates from API
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                setLoading(true);
                setError(null);

                if (viewMode === 'grouped') {
                    const response = await apiClient.getTemplatesGrouped();
                    setDocumentTypes(response.document_types || []);
                    setOrphanTemplates(response.orphan_templates || []);
                    // Also set all templates for filtering
                    const allTemplates = [
                        ...(response.document_types || []).flatMap(dt => dt.templates || []),
                        ...(response.orphan_templates || [])
                    ];
                    setTemplates(allTemplates);
                    // Expand all groups by default
                    setExpandedGroups(new Set((response.document_types || []).map(dt => dt.id)));
                } else {
                    const response = await apiClient.getAllTemplates();
                    setTemplates(response.templates || []);
                }
            } catch (err) {
                console.error('Failed to load templates:', err);
                setError(err instanceof Error ? err.message : 'Failed to load templates');
            } finally {
                setLoading(false);
            }
        };

        loadTemplates();
    }, [viewMode]);

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Build dynamic filter sections from template data
    const filterSections: FilterSection[] = [
        {
            id: "category",
            title: "หมวดหมู่",
            options: Array.from(new Set(templates.map(t => t.category).filter(Boolean))).sort(),
        },
        {
            id: "type",
            title: "ประเภท",
            options: Array.from(new Set(templates.map(t => t.type).filter(Boolean))).sort(),
        },
        {
            id: "tier",
            title: "ระดับ",
            options: Array.from(new Set(templates.map(t => t.tier).filter(Boolean))).sort(),
        },
    ].filter(section => section.options.length > 0);

    const handleFilterChange = (sectionId: string, option: string) => {
        setSelectedFilters((prev) => {
            const current = prev[sectionId] || [];
            const updated = current.includes(option)
                ? current.filter((item) => item !== option)
                : [...current, option];
            return { ...prev, [sectionId]: updated };
        });
    };

    const clearFilters = () => {
        setSelectedFilters({
            category: [],
            type: [],
            tier: [],
        });
        setSearchQuery("");
    };

    const hasActiveFilters =
        Object.values(selectedFilters).some((arr) => arr.length > 0) ||
        searchQuery.length > 0;

    // Filter templates
    const filteredTemplates = templates.filter((template) => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (template.display_name || '').toLowerCase().includes(query) ||
                (template.name || '').toLowerCase().includes(query) ||
                (template.description || '').toLowerCase().includes(query) ||
                (template.category || '').toLowerCase().includes(query) ||
                (template.author || '').toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // Category filter
        if (
            selectedFilters.category.length > 0 &&
            !selectedFilters.category.includes(template.category)
        ) {
            return false;
        }

        // Type filter
        if (
            selectedFilters.type.length > 0 &&
            !selectedFilters.type.includes(template.type)
        ) {
            return false;
        }

        // Tier filter
        if (
            selectedFilters.tier.length > 0 &&
            !selectedFilters.tier.includes(template.tier)
        ) {
            return false;
        }

        return true;
    });

    return (
        <section className="bg-background font-sans min-h-screen">
            <div className="container-main section-padding">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        {/* Search */}
                        <div className="mb-6">
                            <h2 className="text-h3 text-foreground mb-4">ค้นหา</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ค้นหาเทมเพลต..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 border border-border-default rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4 text-text-muted hover:text-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Header */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-h4 text-foreground">ตัวกรอง</span>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-body-sm text-text-muted hover:text-primary"
                                >
                                    ล้างตัวกรอง
                                </button>
                            )}
                        </div>

                        {/* Filter Sections */}
                        <div className="bg-surface-alt rounded-lg p-4">
                            {filterSections.length > 0 ? (
                                filterSections.map((section) => (
                                    <FilterSectionComponent
                                        key={section.id}
                                        section={section}
                                        selectedFilters={selectedFilters[section.id] || []}
                                        onFilterChange={(option) =>
                                            handleFilterChange(section.id, option)
                                        }
                                    />
                                ))
                            ) : (
                                <p className="text-body-sm text-text-muted text-center py-4">
                                    {loading ? 'กำลังโหลด...' : 'ไม่มีตัวกรอง'}
                                </p>
                            )}
                        </div>
                    </aside>

                    {/* Right Content - Template List */}
                    <main className="flex-1">
                        {/* Results Header */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-h2 text-foreground mb-2">
                                        เทมเพลตเอกสาร
                                    </h1>
                                    <p className="text-body text-text-muted">
                                        {loading ? 'กำลังโหลด...' : `พบ ${filteredTemplates.length} รายการ`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/settings/document-types"
                                        className="inline-flex items-center gap-2 px-3 py-2 text-text-muted hover:text-foreground border border-border-default rounded-lg hover:bg-surface-alt transition-colors text-body-sm"
                                        title="จัดการประเภทเอกสาร"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/forms/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-body-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        เพิ่มเทมเพลต
                                    </Link>
                                </div>
                            </div>

                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-body text-red-600 mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-primary hover:underline"
                                >
                                    ลองใหม่อีกครั้ง
                                </button>
                            </div>
                        )}

                        {/* Template Cards - Grouped View */}
                        {!loading && !error && (
                            <div>
                                {/* Document Type Groups */}
                                {documentTypes.length > 0 && (
                                    <div className="space-y-2">
                                        {documentTypes.map((docType) => (
                                            <DocumentTypeGroup
                                                key={docType.id}
                                                documentType={docType}
                                                templates={docType.templates || []}
                                                expanded={expandedGroups.has(docType.id)}
                                                onToggle={() => toggleGroup(docType.id)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Ungrouped Templates */}
                                {orphanTemplates.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-h4 text-text-muted mb-4 flex items-center gap-2">
                                            <FolderOpen className="w-5 h-5" />
                                            เทมเพลตที่ยังไม่ได้จัดกลุ่ม ({orphanTemplates.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {orphanTemplates.map((template) => (
                                                <TemplateCard key={template.id} template={template} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {documentTypes.length === 0 && orphanTemplates.length === 0 && (
                                    <div className="text-center py-12 bg-surface-alt rounded-lg">
                                        <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                                        <p className="text-body text-text-muted mb-4">
                                            ยังไม่มีการจัดกลุ่มเทมเพลต
                                        </p>
                                        <Link
                                            href="/settings/document-types"
                                            className="text-primary hover:underline"
                                        >
                                            จัดการประเภทเอกสาร
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
}
