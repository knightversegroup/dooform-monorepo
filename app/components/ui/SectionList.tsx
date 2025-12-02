"use client";

import { useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { FieldDefinition, Entity } from "@/lib/api/types";
import { ENTITY_LABELS } from "@/lib/utils/fieldTypes";

// Section colors
const SECTION_COLORS: Record<Entity, { bg: string; border: string; text: string }> = {
    child: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    mother: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
    father: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
    informant: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    registrar: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
    general: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
};

interface SectionListProps {
    fieldDefinitions: Record<string, FieldDefinition>;
    aliases?: Record<string, string>;
    onOpenCanvas: () => void;
}

export function SectionList({ fieldDefinitions, aliases, onOpenCanvas }: SectionListProps) {
    // Group fields by entity
    const groupedFields = useMemo(() => {
        const groups: Record<Entity, { key: string; label: string }[]> = {
            child: [],
            mother: [],
            father: [],
            informant: [],
            registrar: [],
            general: [],
        };

        Object.entries(fieldDefinitions)
            .filter(([, def]) => !def.group?.startsWith("merged_hidden_"))
            .sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
            .forEach(([key, def]) => {
                // Use entity if it exists in groups, otherwise fallback to "general"
                const entity = def.entity && groups[def.entity] ? def.entity : "general";
                groups[entity].push({
                    key,
                    label: aliases?.[key] || key,
                });
            });

        return groups;
    }, [fieldDefinitions, aliases]);

    // Get entities that have fields
    const activeEntities = (Object.entries(groupedFields) as [Entity, { key: string; label: string }[]][])
        .filter(([, fields]) => fields.length > 0);

    const totalFields = activeEntities.reduce((sum, [, fields]) => sum + fields.length, 0);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-700">ส่วนของฟอร์ม</h3>
                    <p className="text-xs text-gray-400">{activeEntities.length} ส่วน • {totalFields} ช่อง</p>
                </div>
                <button
                    onClick={onOpenCanvas}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                    แก้ไขลำดับ →
                </button>
            </div>

            {/* Section List */}
            <div className="space-y-2">
                {activeEntities.map(([entity, fields]) => {
                    const color = SECTION_COLORS[entity];

                    return (
                        <div
                            key={entity}
                            className={`rounded-lg border ${color.border} ${color.bg} overflow-hidden`}
                        >
                            {/* Section Header */}
                            <div className="px-3 py-2 flex items-center gap-2">
                                <ChevronRight className={`w-4 h-4 ${color.text}`} />
                                <span className={`text-sm font-medium ${color.text}`}>
                                    {ENTITY_LABELS[entity]}
                                </span>
                                <span className={`text-xs ${color.text} opacity-60`}>
                                    {fields.length} ช่อง
                                </span>
                            </div>

                            {/* Fields Preview */}
                            <div className="px-3 pb-2">
                                <div className="flex flex-wrap gap-1">
                                    {fields.slice(0, 5).map((field) => (
                                        <span
                                            key={field.key}
                                            className="text-xs px-2 py-0.5 bg-white/70 rounded text-gray-600"
                                        >
                                            {field.label}
                                        </span>
                                    ))}
                                    {fields.length > 5 && (
                                        <span className="text-xs px-2 py-0.5 text-gray-400">
                                            +{fields.length - 5} อื่นๆ
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeEntities.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                    ยังไม่มีช่องกรอกข้อมูล
                </div>
            )}
        </div>
    );
}

export default SectionList;
