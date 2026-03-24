"use client";

import { useState, useRef, useEffect } from "react";
import {
  Type,
  Bold,
  Strikethrough,
  Calendar,
  Link2,
  Palette,
  Minus,
  Plus,
  Undo2,
  Trash2,
} from "lucide-react";
import {
  AnnotationTool,
  TextStyle,
  COLOR_PRESETS,
  FONT_SIZE_OPTIONS,
} from "./types";

interface PdfToolbarProps {
  activeTool: AnnotationTool;
  style: TextStyle;
  canUndo: boolean;
  selectedAnnotationId: string | null;
  onToolChange: (tool: AnnotationTool) => void;
  onStyleChange: (style: Partial<TextStyle>) => void;
  onUndo: () => void;
  onDeleteSelected: () => void;
}

export function PdfToolbar({
  activeTool,
  style,
  canUndo,
  selectedAnnotationId,
  onToolChange,
  onStyleChange,
  onUndo,
  onDeleteSelected,
}: PdfToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toolBtn = (
    tool: AnnotationTool,
    icon: React.ReactNode,
    label: string
  ) => (
    <button
      type="button"
      onClick={() => onToolChange(tool)}
      title={label}
      className={`p-2 rounded transition-colors ${
        activeTool === tool
          ? "bg-[#000091] text-white"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {icon}
    </button>
  );

  const toggleBtn = (
    key: "bold" | "strikethrough",
    icon: React.ReactNode,
    label: string
  ) => (
    <button
      type="button"
      onClick={() => onStyleChange({ [key]: !style[key] })}
      title={label}
      className={`p-2 rounded transition-colors ${
        style[key]
          ? "bg-[#000091] text-white"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg">
      {/* Annotation type tools */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        {toolBtn("text", <Type className="w-4 h-4" />, "ข้อความ (Text)")}
        {toolBtn("date", <Calendar className="w-4 h-4" />, "วันที่ (Date)")}
        {toolBtn("link", <Link2 className="w-4 h-4" />, "ลิงก์ (Link)")}
      </div>

      {/* Text formatting */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        {toggleBtn("bold", <Bold className="w-4 h-4" />, "ตัวหนา (Bold)")}
        {toggleBtn(
          "strikethrough",
          <Strikethrough className="w-4 h-4" />,
          "ขีดฆ่า (Strikethrough)"
        )}
      </div>

      {/* Font size */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button
          type="button"
          onClick={() =>
            onStyleChange({
              fontSize: Math.max(
                8,
                (FONT_SIZE_OPTIONS[
                  FONT_SIZE_OPTIONS.indexOf(style.fontSize) - 1
                ] ?? style.fontSize - 2)
              ),
            })
          }
          title="ลดขนาด"
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
        >
          <Minus className="w-3 h-3" />
        </button>
        <select
          value={style.fontSize}
          onChange={(e) => onStyleChange({ fontSize: Number(e.target.value) })}
          className="text-sm bg-white border border-gray-200 rounded px-1 py-1.5 w-14 text-center"
        >
          {FONT_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            onStyleChange({
              fontSize: Math.min(
                32,
                (FONT_SIZE_OPTIONS[
                  FONT_SIZE_OPTIONS.indexOf(style.fontSize) + 1
                ] ?? style.fontSize + 2)
              ),
            })
          }
          title="เพิ่มขนาด"
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Color picker */}
      <div className="relative" ref={colorPickerRef}>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="สีข้อความ (Text Color)"
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 flex items-center gap-1"
        >
          <Palette className="w-4 h-4" />
          <span
            className="w-4 h-3 rounded border border-gray-300"
            style={{ backgroundColor: style.color }}
          />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onStyleChange({ color: c });
                    setShowColorPicker(false);
                  }}
                  className={`w-7 h-7 rounded border-2 transition-transform hover:scale-110 ${
                    style.color === c ? "border-[#000091]" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <input
              type="color"
              value={style.color}
              onChange={(e) => onStyleChange({ color: e.target.value })}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {selectedAnnotationId && (
          <button
            type="button"
            onClick={onDeleteSelected}
            title="ลบ annotation ที่เลือก"
            className="p-2 rounded bg-white text-red-600 hover:bg-red-50 border border-gray-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="เลิกทำ (Undo)"
          className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
