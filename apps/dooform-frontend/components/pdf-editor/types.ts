export type AnnotationTool =
  | "text"
  | "date"
  | "link"
  | "bold"
  | "strikethrough";

export interface TextStyle {
  bold: boolean;
  strikethrough: boolean;
  color: string;
  fontSize: number;
}

export interface Annotation {
  id: string;
  pageIndex: number;
  /** X position as percentage of page width (0-100) */
  x: number;
  /** Y position as percentage of page height (0-100) */
  y: number;
  text: string;
  style: TextStyle;
  type: "text" | "date" | "link";
  /** URL for link type annotations */
  href?: string;
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  bold: false,
  strikethrough: false,
  color: "#000000",
  fontSize: 14,
};

export const FONT_SIZE_OPTIONS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

export const COLOR_PRESETS = [
  "#000000",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
  "#FFFFFF",
];
