/**
 * Download section component for the download step
 */

import { ChevronDown, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useTier } from "@dooform/shared/auth/hooks";
import { WatermarkSection } from "@/components/ui/watermark";

interface DownloadSectionProps {
  selectedFileType: "docx" | "pdf";
  onFileTypeChange: (type: "docx" | "pdf") => void;
  success: {
    documentId: string;
    downloadUrl: string;
    downloadPdfUrl?: string;
  } | null;
  watermarkEnabled: boolean;
  watermarkPresetId: string | null;
  onWatermarkEnabledChange: (enabled: boolean) => void;
  onWatermarkPresetIdChange: (id: string | null) => void;
}

/**
 * Renders the download step content with file type selection
 */
export function DownloadSection({
  selectedFileType,
  onFileTypeChange,
  success,
  watermarkEnabled,
  watermarkPresetId,
  onWatermarkEnabledChange,
  onWatermarkPresetIdChange,
}: DownloadSectionProps) {
  const { canDownloadDocx } = useTier();

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex flex-col items-start justify-center px-4 py-2 w-full">
        <div className="flex flex-col gap-4 items-start w-full">
          {/* File Type Selection */}
          <div className="flex flex-col gap-2 items-start w-full">
            <label
              htmlFor="file-type-select"
              className="font-semibold text-[#171717] text-base"
            >
              เลือกประเภทไฟล์
            </label>
            <div className="relative">
              <select
                id="file-type-select"
                value={!canDownloadDocx && selectedFileType === "docx" ? "pdf" : selectedFileType}
                onChange={(e) =>
                  onFileTypeChange(e.target.value as "docx" | "pdf")
                }
                className="
                                   bg-[#f0f0f0]
                  border-b-2 border-[#5b5b5b] border-l-0 border-r-0 border-t-0
                  px-4 py-[13px] pr-10
                  text-base
                  text-[#5b5b5b]
                  outline-none
                  appearance-none
                  min-w-[140px]
                  cursor-pointer
                "
              >
                <option value="pdf">ไฟล์ PDF</option>
                <option value="docx" disabled={!canDownloadDocx}>
                  ไฟล์ DOCX {!canDownloadDocx ? "(Pro)" : ""}
                </option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5b5b5b] pointer-events-none"
                aria-hidden="true"
              />
            </div>
            {!canDownloadDocx && (
              <div className="flex items-center gap-1.5 mt-1">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs text-neutral-500">
                  ต้องการส่งออก DOCX?{" "}
                  <Link
                    href="/pricing"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    อัปเกรดเป็น Pro
                  </Link>
                </span>
              </div>
            )}
          </div>

          {/* Watermark control - only for PDF */}
          {selectedFileType === "pdf" && (
            <WatermarkSection
              enabled={watermarkEnabled}
              selectedPresetId={watermarkPresetId}
              onEnabledChange={onWatermarkEnabledChange}
              onSelectedPresetIdChange={onWatermarkPresetIdChange}
            />
          )}

          {/* Success Message */}
          {success && (
            <div
              className="w-full p-4 bg-green-50 border-l-4 border-green-500 mt-4"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
                <p className="text-green-700">
                  เอกสารพร้อมให้ดาวน์โหลดแล้ว
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
