"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@dooform/shared/api/client";
import type { WatermarkPreset, WatermarkPresetInput } from "@dooform/shared/api/types";
import { logger } from "@dooform/shared/utils/logger";

interface UseWatermarkPresetsState {
  presets: WatermarkPreset[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that manages the current user's watermark presets with optimistic
 * updates. The list is fetched once on mount; mutations update local state
 * immediately and re-sync on failure.
 */
export function useWatermarkPresets() {
  const [state, setState] = useState<UseWatermarkPresetsState>({
    presets: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const presets = await apiClient.listWatermarkPresets();
      setState({ presets, loading: false, error: null });
    } catch (err) {
      logger.error("useWatermarkPresets", "list failed:", err);
      setState({
        presets: [],
        loading: false,
        error: err instanceof Error ? err.message : "ไม่สามารถโหลดลายน้ำได้",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (input: WatermarkPresetInput): Promise<WatermarkPreset> => {
    const created = await apiClient.createWatermarkPreset(input);
    setState((s) => ({ ...s, presets: [created, ...s.presets] }));
    return created;
  }, []);

  const update = useCallback(async (id: string, input: WatermarkPresetInput): Promise<WatermarkPreset> => {
    const updated = await apiClient.updateWatermarkPreset(id, input);
    setState((s) => ({
      ...s,
      presets: s.presets.map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    const previous = state.presets;
    setState((s) => ({ ...s, presets: s.presets.filter((p) => p.id !== id) }));
    try {
      await apiClient.deleteWatermarkPreset(id);
    } catch (err) {
      setState((s) => ({ ...s, presets: previous, error: err instanceof Error ? err.message : "ไม่สามารถลบได้" }));
      throw err;
    }
  }, [state.presets]);

  const uploadLogo = useCallback(async (id: string, file: File): Promise<WatermarkPreset> => {
    const updated = await apiClient.uploadWatermarkLogo(id, file);
    setState((s) => ({
      ...s,
      presets: s.presets.map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  }, []);

  return {
    ...state,
    refresh,
    create,
    update,
    remove,
    uploadLogo,
  };
}
