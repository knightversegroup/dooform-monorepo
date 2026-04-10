"use client";

import type { WatermarkConfig, WatermarkPosition } from "@dooform/shared/api/types";

interface WatermarkPagePreviewProps {
  config: WatermarkConfig;
  logoUrl?: string | null;
  /** Preview height in px. Width is derived from A4 ratio. */
  height?: number;
}

// A4 dimensions in mm, matching the backend renderer.
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const PAGE_MARGIN_MM = 14;
// Emblem card is approximated as a fixed box sized relative to the page.
// The real backend size depends on content, but for a placement preview a
// constant reads better.
const EMBLEM_W_MM = 56;
const EMBLEM_H_MM = 32;

function computeAnchor(position: WatermarkPosition): { x: number; y: number } {
  switch (position) {
    case "topLeft":
      return { x: PAGE_MARGIN_MM, y: PAGE_MARGIN_MM };
    case "topCenter":
      return { x: (PAGE_W_MM - EMBLEM_W_MM) / 2, y: PAGE_MARGIN_MM };
    case "topRight":
      return { x: PAGE_W_MM - PAGE_MARGIN_MM - EMBLEM_W_MM, y: PAGE_MARGIN_MM };
    case "centerLeft":
      return { x: PAGE_MARGIN_MM, y: (PAGE_H_MM - EMBLEM_H_MM) / 2 };
    case "center":
      return { x: (PAGE_W_MM - EMBLEM_W_MM) / 2, y: (PAGE_H_MM - EMBLEM_H_MM) / 2 };
    case "centerRight":
      return { x: PAGE_W_MM - PAGE_MARGIN_MM - EMBLEM_W_MM, y: (PAGE_H_MM - EMBLEM_H_MM) / 2 };
    case "bottomLeft":
      return { x: PAGE_MARGIN_MM, y: PAGE_H_MM - PAGE_MARGIN_MM - EMBLEM_H_MM };
    case "bottomCenter":
      return { x: (PAGE_W_MM - EMBLEM_W_MM) / 2, y: PAGE_H_MM - PAGE_MARGIN_MM - EMBLEM_H_MM };
    default: // bottomRight
      return { x: PAGE_W_MM - PAGE_MARGIN_MM - EMBLEM_W_MM, y: PAGE_H_MM - PAGE_MARGIN_MM - EMBLEM_H_MM };
  }
}

/**
 * Renders an A4-proportioned page silhouette with a rectangle showing where
 * the watermark emblem will appear. The emblem body is kept simple (shape
 * outline + first two text lines) so users can focus on placement rather
 * than pixel-perfect styling — for that, use WatermarkPreview.
 */
export function WatermarkPagePreview({ config, logoUrl, height = 260 }: WatermarkPagePreviewProps) {
  const width = height * (PAGE_W_MM / PAGE_H_MM);
  // Place emblem using mm coordinates, then scale the whole svg via viewBox.
  const anchor = computeAnchor(config.position);
  let ex = anchor.x + (config.offsetX ?? 0);
  let ey = anchor.y + (config.offsetY ?? 0);
  if (ex < 0) ex = 0;
  if (ey < 0) ey = 0;
  if (ex + EMBLEM_W_MM > PAGE_W_MM) ex = PAGE_W_MM - EMBLEM_W_MM;
  if (ey + EMBLEM_H_MM > PAGE_H_MM) ey = PAGE_H_MM - EMBLEM_H_MM;

  const fill = config.fontColor || "#0b4db7";
  const opacity = Math.max(0.1, Math.min(1, config.opacity ?? 0.35));
  const topLines = config.lines.slice(0, 2);

  return (
    <svg
      viewBox={`0 0 ${PAGE_W_MM} ${PAGE_H_MM}`}
      width={width}
      height={height}
      role="img"
      aria-label="ตัวอย่างตำแหน่งลายน้ำบนหน้ากระดาษ"
      className="border border-gray-200 bg-white shadow-sm rounded-sm"
    >
      {/* Page outline already provided by border via style; draw margin guides */}
      <rect
        x={PAGE_MARGIN_MM}
        y={PAGE_MARGIN_MM}
        width={PAGE_W_MM - 2 * PAGE_MARGIN_MM}
        height={PAGE_H_MM - 2 * PAGE_MARGIN_MM}
        fill="none"
        stroke="#e5e7eb"
        strokeDasharray="1 1"
        strokeWidth={0.4}
      />

      {/* Emblem */}
      <g style={{ opacity }} transform={`rotate(${config.rotation || 0} ${ex + EMBLEM_W_MM / 2} ${ey + EMBLEM_H_MM / 2})`}>
        {config.shape === "rounded" && (
          <rect x={ex} y={ey} width={EMBLEM_W_MM} height={EMBLEM_H_MM} rx={3} ry={3} fill="none" stroke={fill} strokeWidth={0.8} />
        )}
        {config.shape === "circle" && (
          <ellipse cx={ex + EMBLEM_W_MM / 2} cy={ey + EMBLEM_H_MM / 2} rx={EMBLEM_W_MM / 2} ry={EMBLEM_H_MM / 2} fill="none" stroke={fill} strokeWidth={0.8} />
        )}
        {logoUrl && (
          <image
            href={logoUrl}
            x={ex + EMBLEM_W_MM / 2 - 4}
            y={ey + 4}
            width={8}
            height={8}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        {topLines.map((ln, idx) => (
          <text
            key={idx}
            x={ex + EMBLEM_W_MM / 2}
            y={ey + EMBLEM_H_MM / 2 + idx * 4 - (topLines.length - 1) * 2}
            fill={fill}
            fontSize={4}
            fontWeight={ln.bold ? 700 : 400}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {ln.text}
          </text>
        ))}
      </g>
    </svg>
  );
}
