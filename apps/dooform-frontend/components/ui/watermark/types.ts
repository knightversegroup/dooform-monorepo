// Re-exports the watermark types from the shared package so consumers
// inside this feature folder don't need to reach into @dooform/shared.
export type {
  WatermarkPreset,
  WatermarkPresetInput,
  WatermarkConfig,
  WatermarkLine,
  WatermarkPosition,
  WatermarkShape,
  WatermarkScope,
} from "@dooform/shared/api/types";

export const DEFAULT_WATERMARK_CONFIG = {
  lines: [
    { text: "DOOFORM", bold: true, size: 12 },
    { text: "Verified document", size: 9 },
  ],
  fontColor: "#0b4db7",
  opacity: 0.35,
  rotation: 0,
  position: "bottomRight" as const,
  shape: "rounded" as const,
  scope: "allPages" as const,
};
