import { useEffect, useState } from 'react';

interface UseCarouselOptions {
  count: number;
  intervalMs: number;
  transitionMs: number;
}

interface CarouselState {
  /** Index of the item currently fully visible (or sliding out). */
  index: number;
  /** True for the transitionMs window while the slide animates. */
  animating: boolean;
}

/**
 * Drives a two-layer "spin" carousel. Hands back the index of the current and
 * the next item, plus an `animating` flag that callers use to toggle their
 * transition class. When `animating` flips back to `false`, the layers should
 * snap to their resting positions instantly (so the cycle keeps looping).
 *
 * Usage:
 *   const { index, nextIndex, animating } = useCarousel({ count, intervalMs, transitionMs });
 *   const transitionCls = animating ? 'transition-transform duration-500' : '';
 *   const outgoingTranslate = animating ? '-translate-y-full' : 'translate-y-0';
 *   const incomingTranslate = animating ? 'translate-y-0'    : 'translate-y-full';
 */
export function useCarousel({
  count,
  intervalMs,
  transitionMs,
}: UseCarouselOptions) {
  const [state, setState] = useState<CarouselState>({
    index: 0,
    animating: false,
  });

  // Reset when the source set changes (e.g. an admin published a new item).
  useEffect(() => {
    setState({ index: 0, animating: false });
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const tick = () => {
      setState((s) => ({ ...s, animating: true }));
      window.setTimeout(() => {
        setState((s) => ({ index: (s.index + 1) % count, animating: false }));
      }, transitionMs);
    };
    const interval = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(interval);
  }, [count, intervalMs, transitionMs]);

  const nextIndex = count > 0 ? (state.index + 1) % count : 0;
  return {
    index: state.index,
    nextIndex,
    animating: state.animating,
  };
}
