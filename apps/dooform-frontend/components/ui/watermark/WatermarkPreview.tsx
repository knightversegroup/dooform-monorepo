"use client";

import type { WatermarkConfig } from "@dooform/shared/api/types";

interface WatermarkPreviewProps {
  config: WatermarkConfig;
  logoUrl?: string | null;
  width?: number;
  height?: number;
  /** Extra CSS class applied to the outer <svg>. */
  className?: string;
}

/**
 * Lightweight SVG preview of the emblem. Mirrors the server-side renderer
 * closely enough for users to recognise what they're about to stamp, but is
 * intentionally not pixel-perfect — the real rendering happens on the
 * backend via pdfcpu.
 */
export function WatermarkPreview({
  config,
  logoUrl,
  width = 180,
  height = 120,
  className,
}: WatermarkPreviewProps) {
  const fillColor = config.fontColor || "#0b4db7";
  const opacity = Math.max(0.1, Math.min(1, config.opacity ?? 0.35));

  // When there's no border shape the emblem is effectively margin-free;
  // only a small breathing gap is kept to stop glyphs from touching the
  // card edge. With a border we need more room for the stroke.
  const padding = config.shape === "none" ? 2 : 10;
  const innerX = padding;
  const innerY = padding;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const lines = config.lines.slice(0, 8);
  const layout = logoUrl ? config.logoPosition ?? "top" : "none";

  // Map the backend logoSize (5..80 mm) to a proportional preview box.
  // Default of 14 mm lands at roughly 28% of the smaller inner dimension.
  // A tiny 5 mm logo hits the 15% floor; a huge 80 mm logo saturates the
  // box. The math stays identical across layouts so the slider feels
  // consistent.
  const logoSize = config.logoSize ?? 14;
  const scale = Math.max(0.15, Math.min(0.92, logoSize / 50));
  const logoBoxBase = Math.min(innerW, innerH) * scale;
  const logoBox = logoUrl ? logoBoxBase : 0;
  const logoGap = logoUrl ? 6 : 0;

  // Derive the text column geometry based on layout.
  let textX0 = innerX;
  let textW = innerW;
  let textStartY = innerY;
  let availableTextH = innerH;

  if (layout === "top") {
    availableTextH = innerH - logoBox - logoGap;
    textStartY = innerY + logoBox + logoGap;
  } else if (layout === "left") {
    textX0 = innerX + logoBox + logoGap;
    textW = innerW - logoBox - logoGap;
  } else if (layout === "right") {
    textW = innerW - logoBox - logoGap;
  }

  const lineHeight = lines.length > 0 ? Math.min(18, availableTextH / lines.length) : 14;
  const textBlockH = lines.length * lineHeight;
  // Vertically centre the text block inside its available box.
  const textTop =
    layout === "top"
      ? textStartY
      : innerY + (innerH - textBlockH) / 2;

  // Shape: border element varies by config.shape
  let borderEl: React.ReactNode = null;
  if (config.shape === "rounded") {
    borderEl = (
      <rect
        x={padding / 2}
        y={padding / 2}
        width={width - padding}
        height={height - padding}
        rx={10}
        ry={10}
        fill="none"
        stroke={fillColor}
        strokeWidth={1.5}
      />
    );
  } else if (config.shape === "circle") {
    borderEl = (
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={innerW / 2 + 2}
        ry={innerH / 2 + 2}
        fill="none"
        stroke={fillColor}
        strokeWidth={1.5}
      />
    );
  }

  // Logo placement.
  let logoEl: React.ReactNode = null;
  if (logoUrl) {
    let lx = 0;
    let ly = 0;
    if (layout === "top") {
      lx = innerX + (innerW - logoBox) / 2;
      ly = innerY;
    } else if (layout === "left") {
      lx = innerX;
      ly = innerY + (innerH - logoBox) / 2;
    } else if (layout === "right") {
      lx = innerX + innerW - logoBox;
      ly = innerY + (innerH - logoBox) / 2;
    }
    logoEl = (
      <image
        href={logoUrl}
        x={lx}
        y={ly}
        width={logoBox}
        height={logoBox}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="ตัวอย่างลายน้ำ"
      className={className}
      style={{ opacity }}
    >
      {borderEl}
      {logoEl}
      {lines.map((line, idx) => {
        const lineY = textTop + idx * lineHeight + lineHeight * 0.75;
        const size = line.size ?? 11;
        return (
          <text
            key={idx}
            x={textX0 + textW / 2}
            y={lineY}
            fill={fillColor}
            fontSize={Math.min(16, size)}
            fontWeight={line.bold ? 700 : 400}
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {line.text}
          </text>
        );
      })}
    </svg>
  );
}
