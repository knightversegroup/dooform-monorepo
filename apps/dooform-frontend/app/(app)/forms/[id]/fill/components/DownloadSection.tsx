/**
 * Download section component for the download step
 * Includes PDF editor for post-processing annotations
 */

"use client";

import { useState, useEffect } from "react";
import { ChevronDown, CheckCircle, Loader2 } from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import { PdfEditor } from "@/components/pdf-editor";

interface DownloadSectionProps {
  selectedFileType: "docx" | "pdf";
  onFileTypeChange: (type: "docx" | "pdf") => void;
  success: {
    documentId: string;
    downloadUrl: string;
    downloadPdfUrl?: string;
  } | null;
  templateName?: string;
}

/**
 * Renders the download step content with file type selection and PDF editor
 */
export function DownloadSection({
  selectedFileType,
  onFileTypeChange,
  success,
  templateName,
}: DownloadSectionProps) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Load PDF blob when component mounts and success is available
  useEffect(() => {
    if (!success || selectedFileType !== "pdf") {
      setPdfBlob(null);
      return;
    }

    let cancelled = false;

    async function fetchPdf() {
      setLoadingPdf(true);
      setPdfError(null);
      try {
        const blob = await apiClient.downloadDocument(
          success!.documentId,
          "pdf"
        );
        if (!cancelled) {
          setPdfBlob(blob);
        }
      } catch {
        if (!cancelled) {
          setPdfError("ไม่สามารถโหลดไฟล์ PDF ได้ กรุณาลองดาวน์โหลดอีกครั้ง");
        }
      } finally {
        if (!cancelled) {
          setLoadingPdf(false);
        }
      }
    }

    fetchPdf();
    return () => {
      cancelled = true;
    };
  }, [success, selectedFileType]);

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
                value={selectedFileType}
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
                <option value="docx">ไฟล์ DOCX</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5b5b5b] pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div
              className="w-full p-4 bg-green-50 border-l-4 border-green-500 mt-2"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <CheckCircle
                  className="w-5 h-5 text-green-600"
                  aria-hidden="true"
                />
                <p className="text-green-700">
                  เอกสารพร้อมให้ดาวน์โหลดแล้ว
                  {selectedFileType === "pdf" &&
                    " — คุณสามารถแก้ไขเพิ่มเติมก่อนดาวน์โหลดได้"}
                </p>
              </div>
            </div>
          )}

          {/* PDF Editor */}
          {selectedFileType === "pdf" && success && (
            <div className="w-full mt-2">
              {loadingPdf && (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#000091] animate-spin" />
                    <p className="text-sm text-gray-600">
                      กำลังโหลด PDF เพื่อแก้ไข...
                    </p>
                  </div>
                </div>
              )}
              {pdfError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-red-700 text-sm">{pdfError}</p>
                </div>
              )}
              {pdfBlob && !loadingPdf && (
                <PdfEditor
                  pdfBlob={pdfBlob}
                  fileName={`${templateName || "document"}.pdf`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
