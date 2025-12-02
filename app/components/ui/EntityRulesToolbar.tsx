"use client";

import { useState, useCallback } from "react";
import {
    X,
    Plus,
    Play,
    Trash2,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    Wand2,
} from "lucide-react";
import type { Entity, FieldDefinition } from "@/lib/api/types";
import { ENTITY_LABELS } from "@/lib/utils/fieldTypes";

// Rule match types
type MatchType = "starts_with" | "ends_with" | "contains" | "regex" | "equals";

const MATCH_TYPE_LABELS: Record<MatchType, string> = {
    starts_with: "เริ่มต้นด้วย",
    ends_with: "ลงท้ายด้วย",
    contains: "มีคำว่า",
    regex: "Regex",
    equals: "เท่ากับ",
};

interface EntityRule {
    id: string;
    matchType: MatchType;
    pattern: string;
    targetEntity: Entity;
    isActive: boolean;
}

// Default rules based on common patterns
const DEFAULT_RULES: EntityRule[] = [
    { id: "rule-1", matchType: "starts_with", pattern: "m_", targetEntity: "mother", isActive: true },
    { id: "rule-2", matchType: "starts_with", pattern: "f_", targetEntity: "father", isActive: true },
    { id: "rule-3", matchType: "starts_with", pattern: "b_", targetEntity: "informant", isActive: true },
    { id: "rule-4", matchType: "starts_with", pattern: "r_", targetEntity: "registrar", isActive: true },
    { id: "rule-5", matchType: "starts_with", pattern: "c_", targetEntity: "child", isActive: true },
];

interface EntityRulesToolbarProps {
    fieldDefinitions: Record<string, FieldDefinition>;
    onBulkEntityUpdate: (updates: Record<string, Entity>) => void;
    isOpen: boolean;
    onClose: () => void;
}

// Check if a field key matches a rule
function matchesRule(fieldKey: string, rule: EntityRule): boolean {
    if (!rule.isActive || !rule.pattern) return false;

    const key = fieldKey.toLowerCase();
    const pattern = rule.pattern.toLowerCase();

    switch (rule.matchType) {
        case "starts_with":
            return key.startsWith(pattern);
        case "ends_with":
            return key.endsWith(pattern);
        case "contains":
            return key.includes(pattern);
        case "equals":
            return key === pattern;
        case "regex":
            try {
                const regex = new RegExp(rule.pattern, "i");
                return regex.test(fieldKey);
            } catch {
                return false;
            }
        default:
            return false;
    }
}

export function EntityRulesToolbar({
    fieldDefinitions,
    onBulkEntityUpdate,
    isOpen,
    onClose,
}: EntityRulesToolbarProps) {
    const [rules, setRules] = useState<EntityRule[]>(DEFAULT_RULES);
    const [previewResults, setPreviewResults] = useState<Record<string, Entity> | null>(null);
    const [appliedCount, setAppliedCount] = useState<number | null>(null);

    // Add new rule
    const addRule = useCallback(() => {
        const newRule: EntityRule = {
            id: `rule-${Date.now()}`,
            matchType: "starts_with",
            pattern: "",
            targetEntity: "general",
            isActive: true,
        };
        setRules((prev) => [...prev, newRule]);
    }, []);

    // Update rule
    const updateRule = useCallback((id: string, updates: Partial<EntityRule>) => {
        setRules((prev) =>
            prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
        );
        setPreviewResults(null);
        setAppliedCount(null);
    }, []);

    // Delete rule
    const deleteRule = useCallback((id: string) => {
        setRules((prev) => prev.filter((rule) => rule.id !== id));
        setPreviewResults(null);
        setAppliedCount(null);
    }, []);

    // Preview what rules would change
    const previewRules = useCallback(() => {
        const updates: Record<string, Entity> = {};

        Object.entries(fieldDefinitions).forEach(([fieldKey, def]) => {
            // Find first matching rule (priority by order)
            for (const rule of rules) {
                if (matchesRule(fieldKey, rule)) {
                    // Only mark if entity would change
                    if (def.entity !== rule.targetEntity) {
                        updates[fieldKey] = rule.targetEntity;
                    }
                    break;
                }
            }
        });

        setPreviewResults(updates);
        setAppliedCount(null);
    }, [fieldDefinitions, rules]);

    // Apply rules
    const applyRules = useCallback(() => {
        const updates: Record<string, Entity> = {};

        Object.entries(fieldDefinitions).forEach(([fieldKey, def]) => {
            // Find first matching rule (priority by order)
            for (const rule of rules) {
                if (matchesRule(fieldKey, rule)) {
                    if (def.entity !== rule.targetEntity) {
                        updates[fieldKey] = rule.targetEntity;
                    }
                    break;
                }
            }
        });

        if (Object.keys(updates).length > 0) {
            onBulkEntityUpdate(updates);
            setAppliedCount(Object.keys(updates).length);
            setPreviewResults(null);
        }
    }, [fieldDefinitions, rules, onBulkEntityUpdate]);

    // Reset to default rules
    const resetToDefaults = useCallback(() => {
        setRules(DEFAULT_RULES);
        setPreviewResults(null);
        setAppliedCount(null);
    }, []);

    if (!isOpen) return null;

    const activeRulesCount = rules.filter((r) => r.isActive && r.pattern).length;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Wand2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">กฎการจัดกลุ่มอัตโนมัติ</h2>
                            <p className="text-xs text-gray-500">กำหนดกฎเพื่อจัดกลุ่มช่องกรอกข้อมูลตามรูปแบบชื่อ</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Rules List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                            {activeRulesCount} กฎที่ใช้งาน • {Object.keys(fieldDefinitions).length} ช่องทั้งหมด
                        </span>
                        <button
                            onClick={resetToDefaults}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            รีเซ็ตเป็นค่าเริ่มต้น
                        </button>
                    </div>

                    {rules.map((rule, index) => (
                        <div
                            key={rule.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                rule.isActive ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-60"
                            }`}
                        >
                            {/* Rule number / toggle */}
                            <button
                                onClick={() => updateRule(rule.id, { isActive: !rule.isActive })}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                                    rule.isActive
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {index + 1}
                            </button>

                            {/* If label */}
                            <span className="text-sm text-gray-500 font-medium">ถ้า</span>

                            {/* Match type dropdown */}
                            <div className="relative">
                                <select
                                    value={rule.matchType}
                                    onChange={(e) => updateRule(rule.id, { matchType: e.target.value as MatchType })}
                                    className="appearance-none bg-gray-100 text-sm px-3 py-1.5 pr-8 rounded-lg border-0 focus:ring-2 focus:ring-purple-500"
                                    disabled={!rule.isActive}
                                >
                                    {Object.entries(MATCH_TYPE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Pattern input */}
                            <input
                                type="text"
                                value={rule.pattern}
                                onChange={(e) => updateRule(rule.id, { pattern: e.target.value })}
                                placeholder={rule.matchType === "regex" ? "^[mf]_.*" : "m_"}
                                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={!rule.isActive}
                            />

                            {/* Then label */}
                            <span className="text-sm text-gray-500 font-medium">→</span>

                            {/* Target entity dropdown */}
                            <div className="relative">
                                <select
                                    value={rule.targetEntity}
                                    onChange={(e) => updateRule(rule.id, { targetEntity: e.target.value as Entity })}
                                    className="appearance-none bg-purple-50 text-purple-700 text-sm px-3 py-1.5 pr-8 rounded-lg border-0 focus:ring-2 focus:ring-purple-500 font-medium"
                                    disabled={!rule.isActive}
                                >
                                    {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={() => deleteRule(rule.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                            </button>
                        </div>
                    ))}

                    {/* Add rule button */}
                    <button
                        onClick={addRule}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        เพิ่มกฎใหม่
                    </button>

                    {/* Preview results */}
                    {previewResults && Object.keys(previewResults).length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    ตัวอย่างผลลัพธ์: {Object.keys(previewResults).length} ช่องจะถูกเปลี่ยนกลุ่ม
                                </span>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                                {Object.entries(previewResults).map(([fieldKey, newEntity]) => (
                                    <div key={fieldKey} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-700 font-mono">{fieldKey}</span>
                                        <span className="text-blue-600">
                                            {fieldDefinitions[fieldKey]?.entity && ENTITY_LABELS[fieldDefinitions[fieldKey].entity]} → {ENTITY_LABELS[newEntity]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {previewResults && Object.keys(previewResults).length === 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">ไม่มีช่องที่ต้องเปลี่ยนกลุ่ม (อาจจัดกลุ่มถูกต้องแล้ว)</span>
                            </div>
                        </div>
                    )}

                    {appliedCount !== null && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    อัพเดท {appliedCount} ช่องเรียบร้อยแล้ว!
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500">
                        กฎจะถูกประมวลผลตามลำดับ • กฎแรกที่ตรงจะถูกใช้งาน
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={previewRules}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <AlertCircle className="w-4 h-4" />
                            ดูตัวอย่าง
                        </button>
                        <button
                            onClick={applyRules}
                            disabled={activeRulesCount === 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play className="w-4 h-4" />
                            ใช้งานกฎทั้งหมด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EntityRulesToolbar;
