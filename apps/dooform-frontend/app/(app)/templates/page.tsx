"use client";

import { useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import TemplateGroupList from "@/components/templates/TemplateGroupList";
import TemplateCardGrid from "@/components/templates/TemplateCardGrid";

type ViewMode = "list" | "grid";

export default function TemplatesPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    return (
        <div>
            {/* View Toggle */}
            <div className="max-w-[1080px] mx-auto px-[8px] pt-6 flex justify-end">
                <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                            viewMode === "list"
                                ? "bg-white text-[#013087] shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <List className="w-4 h-4" />
                        รายการ
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                            viewMode === "grid"
                                ? "bg-white text-[#013087] shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        การ์ด
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === "list" ? <TemplateGroupList /> : <TemplateCardGrid />}
        </div>
    );
}
