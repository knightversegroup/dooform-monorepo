"use client";

import { useRef, useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import type { Annotation } from "./types";

interface PdfAnnotationProps {
  annotation: Annotation;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<Annotation>) => void;
  onDoubleClick: () => void;
}

export function PdfAnnotation({
  annotation,
  isSelected,
  containerWidth,
  containerHeight,
  onSelect,
  onUpdate,
  onDoubleClick,
}: PdfAnnotationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Focus editing when entering edit mode
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect();

    const startX = e.clientX;
    const startY = e.clientY;
    const startPctX = annotation.x;
    const startPctY = annotation.y;
    let moved = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      if (!moved) return;
      setIsDragging(true);

      const newX = startPctX + (dx / containerWidth) * 100;
      const newY = startPctY + (dy / containerHeight) * 100;

      onUpdate({
        x: Math.max(0, Math.min(95, newX)),
        y: Math.max(0, Math.min(95, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onDoubleClick();
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      const newText = textRef.current.innerText;
      if (newText !== annotation.text) {
        onUpdate({ text: newText });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
      e.preventDefault();
      setIsEditing(false);
      textRef.current?.blur();
    }
  };

  const left = (annotation.x / 100) * containerWidth;
  const top = (annotation.y / 100) * containerHeight;

  return (
    <div
      className={`absolute group ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Selection outline */}
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-[#000091] rounded pointer-events-none" />
      )}

      {/* Drag handle */}
      {isSelected && !isEditing && (
        <div className="absolute -left-5 top-0 text-gray-400">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Text content */}
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`outline-none min-w-[20px] whitespace-pre-wrap ${
          isEditing ? "ring-2 ring-[#000091] rounded px-1" : ""
        } ${annotation.type === "link" ? "underline" : ""}`}
        style={{
          fontWeight: annotation.style.bold ? "bold" : "normal",
          textDecoration: annotation.style.strikethrough
            ? "line-through"
            : annotation.type === "link"
              ? "underline"
              : "none",
          color: annotation.style.color,
          fontSize: `${annotation.style.fontSize}px`,
          lineHeight: 1.3,
        }}
      >
        {annotation.text}
      </div>
    </div>
  );
}
