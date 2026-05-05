import { apiBaseUrl, http } from './client';
import type {
  WatermarkConfig,
  WatermarkPreset,
  WatermarkPresetsResponse,
} from './types';

export function listWatermarkPresets() {
  return http.get<WatermarkPresetsResponse>('/v1/watermark-presets');
}

export function watermarkLogoBlobUrl(id: string): string {
  return `${apiBaseUrl}/v1/watermark-presets/${id}/logo`;
}

export function getWatermarkPreset(id: string) {
  return http.get<WatermarkPreset>(`/v1/watermark-presets/${id}`);
}

export function createWatermarkPreset(input: {
  name: string;
  config: WatermarkConfig;
}) {
  return http.post<WatermarkPreset>('/v1/watermark-presets', { body: input });
}

export function updateWatermarkPreset(
  id: string,
  input: { name?: string; config?: WatermarkConfig }
) {
  return http.put<WatermarkPreset>(`/v1/watermark-presets/${id}`, {
    body: input,
  });
}

export function deleteWatermarkPreset(id: string) {
  return http.delete<void>(`/v1/watermark-presets/${id}`);
}

export function uploadWatermarkLogo(id: string, file: File) {
  const formData = new FormData();
  formData.append('logo', file);
  return http.post<{ logoUrl?: string; logoPath?: string }>(
    `/v1/watermark-presets/${id}/logo`,
    { formData }
  );
}

export function watermarkLogoUrl(id: string): string {
  return `${apiBaseUrl}/v1/watermark-presets/${id}/logo`;
}
