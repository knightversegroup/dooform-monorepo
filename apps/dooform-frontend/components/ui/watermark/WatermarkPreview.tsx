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

  // Determine centre and content layout
  const cx = width / 2;
  const cy = height / 2;
  const padding = 10;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const lines = config.lines.slice(0, 8);
  const logoH = logoUrl ? 24 : 0;
  const availableH = innerH - logoH - (logoUrl ? 4 : 0);
  const lineHeight = lines.length > 0 ? Math.min(18, availableH / lines.length) : 14;

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
        cx={cx}
        cy={cy}
        rx={innerW / 2 + 2}
        ry={innerH / 2 + 2}
        fill="none"
        stroke={fillColor}
        strokeWidth={1.5}
      />
    );
  }

  // Start y position for text stack
  const textBlockH = lines.length * lineHeight + (logoUrl ? logoH + 4 : 0);
  let y = cy - textBlockH / 2 + (logoUrl ? logoH + 4 : 0);

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
      {logoUrl && (
        <image
          href={logoUrl}
          x={cx - 12}
          y={cy - textBlockH / 2}
          width={24}
          height={24}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      {lines.map((line, idx) => {
        const lineY = y + idx * lineHeight + lineHeight * 0.75;
        const size = line.size ?? 11;
        return (
          <text
            key={idx}
            x={cx}
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
