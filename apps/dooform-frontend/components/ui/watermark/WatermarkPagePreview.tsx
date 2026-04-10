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
const EMBLEM_PAD_MM = 6;
const EMBLEM_PAD_NONE_MM = 1;
const LOGO_GAP_MM = 3;
// Rough placeholder for the text block — the page preview is a placement
// hint, not a fidelity render, so a single constant reads better than
// re-implementing the full layout engine.
const TEXT_BLOCK_W_MM = 30;
const TEXT_BLOCK_H_MM = 14;

function computeEmblemSize(
  hasLogo: boolean,
  logoSize: number,
  layout: "top" | "left" | "right" | "none",
  pad: number,
  minW: number
): { w: number; h: number } {
  if (!hasLogo) {
    return {
      w: Math.max(minW, TEXT_BLOCK_W_MM + 2 * pad),
      h: TEXT_BLOCK_H_MM + 2 * pad,
    };
  }
  switch (layout) {
    case "top":
      return {
        w: Math.max(minW, Math.max(logoSize, TEXT_BLOCK_W_MM) + 2 * pad),
        h: logoSize + LOGO_GAP_MM + TEXT_BLOCK_H_MM + 2 * pad,
      };
    case "left":
    case "right":
      return {
        w: Math.max(minW, logoSize + LOGO_GAP_MM + TEXT_BLOCK_W_MM + 2 * pad),
        h: Math.max(logoSize, TEXT_BLOCK_H_MM) + 2 * pad,
      };
    default:
      return {
        w: Math.max(minW, TEXT_BLOCK_W_MM + 2 * pad),
        h: TEXT_BLOCK_H_MM + 2 * pad,
      };
  }
}

function computeAnchor(
  position: WatermarkPosition,
  emblemW: number,
  emblemH: number
): { x: number; y: number } {
  switch (position) {
    case "topLeft":
      return { x: PAGE_MARGIN_MM, y: PAGE_MARGIN_MM };
    case "topCenter":
      return { x: (PAGE_W_MM - emblemW) / 2, y: PAGE_MARGIN_MM };
    case "topRight":
      return { x: PAGE_W_MM - PAGE_MARGIN_MM - emblemW, y: PAGE_MARGIN_MM };
    case "centerLeft":
      return { x: PAGE_MARGIN_MM, y: (PAGE_H_MM - emblemH) / 2 };
    case "center":
      return { x: (PAGE_W_MM - emblemW) / 2, y: (PAGE_H_MM - emblemH) / 2 };
    case "centerRight":
      return { x: PAGE_W_MM - PAGE_MARGIN_MM - emblemW, y: (PAGE_H_MM - emblemH) / 2 };
    case "bottomLeft":
      return { x: PAGE_MARGIN_MM, y: PAGE_H_MM - PAGE_MARGIN_MM - emblemH };
    case "bottomCenter":
      return { x: (PAGE_W_MM - emblemW) / 2, y: PAGE_H_MM - PAGE_MARGIN_MM - emblemH };
    default: // bottomRight
      return { x: PAGE_W_MM - PAGE_MARGIN_MM - emblemW, y: PAGE_H_MM - PAGE_MARGIN_MM - emblemH };
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

  const hasLogo = !!logoUrl;
  const layout = hasLogo ? config.logoPosition ?? "top" : "none";
  const logoSize = config.logoSize ?? 14;
  const pad = config.shape === "none" ? EMBLEM_PAD_NONE_MM : EMBLEM_PAD_MM;
  const minW = config.shape === "none" ? 0 : 44;
  const { w: emblemW, h: emblemH } = computeEmblemSize(hasLogo, logoSize, layout, pad, minW);

  // Place emblem using mm coordinates, then scale the whole svg via viewBox.
  const anchor = computeAnchor(config.position, emblemW, emblemH);
  let ex = anchor.x + (config.offsetX ?? 0);
  let ey = anchor.y + (config.offsetY ?? 0);
  if (ex < 0) ex = 0;
  if (ey < 0) ey = 0;
  if (ex + emblemW > PAGE_W_MM) ex = PAGE_W_MM - emblemW;
  if (ey + emblemH > PAGE_H_MM) ey = PAGE_H_MM - emblemH;

  const fill = config.fontColor || "#0b4db7";
  const opacity = Math.max(0.1, Math.min(1, config.opacity ?? 0.35));
  const topLines = config.lines.slice(0, 2);

  // Logo position within the emblem — matches backend layout math.
  let logoX = 0;
  let logoY = 0;
  let textCenterX = ex + emblemW / 2;
  let textCenterY = ey + emblemH / 2;
  if (layout === "top") {
    logoX = ex + (emblemW - logoSize) / 2;
    logoY = ey + pad;
    textCenterY = logoY + logoSize + LOGO_GAP_MM + TEXT_BLOCK_H_MM / 2;
  } else if (layout === "left") {
    logoX = ex + pad;
    logoY = ey + (emblemH - logoSize) / 2;
    const textX0 = logoX + logoSize + LOGO_GAP_MM;
    textCenterX = textX0 + (ex + emblemW - pad - textX0) / 2;
  } else if (layout === "right") {
    logoX = ex + emblemW - pad - logoSize;
    logoY = ey + (emblemH - logoSize) / 2;
    const textX0 = ex + pad;
    textCenterX = textX0 + (logoX - LOGO_GAP_MM - textX0) / 2;
  }

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
      <g style={{ opacity }} transform={`rotate(${config.rotation || 0} ${ex + emblemW / 2} ${ey + emblemH / 2})`}>
        {config.shape === "rounded" && (
          <rect x={ex} y={ey} width={emblemW} height={emblemH} rx={3} ry={3} fill="none" stroke={fill} strokeWidth={0.8} />
        )}
        {config.shape === "circle" && (
          <ellipse cx={ex + emblemW / 2} cy={ey + emblemH / 2} rx={emblemW / 2} ry={emblemH / 2} fill="none" stroke={fill} strokeWidth={0.8} />
        )}
        {logoUrl && (
          <image
            href={logoUrl}
            x={logoX}
            y={logoY}
            width={logoSize}
            height={logoSize}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        {topLines.map((ln, idx) => (
          <text
            key={idx}
            x={textCenterX}
            y={textCenterY + idx * 4 - (topLines.length - 1) * 2}
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
