'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Quote, X } from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type TestimonialItem = {
  id: string;
  tag: string;
  image: string;
  youtubeUrl?: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  linkLabel: string;
  linkHref: string;
};

export type TestimonialsDict = {
  headingLine1: string;
  headingLine2: string;
  prevLabel: string;
  nextLabel: string;
  items: TestimonialItem[];
};

const ARROW_BUTTON_CLASS =
  'flex h-12 w-12 items-center justify-center rounded-full border border-white bg-white text-blue-500 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.4)] transition-colors hover:bg-blue-50';

/* Extract the 11-char YouTube video id from any of the common URL shapes
 * (watch?v=, youtu.be/, /embed/, /shorts/). Returns null if no id is
 * recognizable — caller can then hide the play affordance instead of
 * opening a broken embed. */
function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export default function TestimonialsSection({
  dict,
}: {
  dict: TestimonialsDict;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const total = dict.items.length;

  const goPrev = () => setActiveIndex((i) => (i - 1 + total) % total);
  const goNext = () => setActiveIndex((i) => (i + 1) % total);

  /* Lock background scroll + close on Escape while the modal is open. */
  useEffect(() => {
    if (!videoId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVideoId(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [videoId]);

  return (
    <Section padding="lg" className="bg-df-sky/40">
      <Container>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <Typography variant="h2" as="h2" className="max-w-2xl">
            {dict.headingLine1}
            <br />
            {dict.headingLine2}
          </Typography>
        </div>

        {/* ── Slider ──────────────────────────────────────────────── */}
        <div className="relative mt-10 md:mt-14">
          {/* Side arrows — desktop only. */}
          <button
            type="button"
            onClick={goPrev}
            aria-label={dict.prevLabel}
            className={`absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 md:flex lg:-left-6 ${ARROW_BUTTON_CLASS}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={dict.nextLabel}
            className={`absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 md:flex lg:-right-6 ${ARROW_BUTTON_CLASS}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* All slides share one grid cell so the container sizes to the
           * tallest slide and switching never jolts the page height. */}
          <div className="relative grid md:mx-12 lg:mx-16">
            {dict.items.map((item, i) => {
              const isActive = i === activeIndex;
              const ytId = getYouTubeId(item.youtubeUrl);
              return (
                <div
                  key={item.id}
                  aria-hidden={!isActive}
                  className={`col-start-1 row-start-1 grid grid-cols-1 items-center gap-8 transition-opacity duration-300 ease-out md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-12 ${
                    isActive
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0'
                  }`}
                >
                  {/* Left: image card with tag pill + play button */}
                  <div className="relative">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-blue-100 shadow-[0_24px_60px_-24px_rgba(37,99,235,0.35)]">
                      <img
                        src={item.image}
                        alt=""
                        className="block h-full w-full object-cover"
                        loading="lazy"
                      />
                      {/* Top-left tag */}
                      <div className="absolute left-4 top-4 rounded-full bg-slate-800/90 px-4 py-1.5 backdrop-blur md:left-5 md:top-5">
                        <Typography
                          as="span"
                          variant="body-sm"
                          weight="medium"
                          tone="inherit"
                          className="text-white"
                        >
                          {item.tag}
                        </Typography>
                      </div>
                      {/* Play button — only when a parseable YouTube URL
                       * is configured for this testimonial. */}
                      {ytId && (
                        <button
                          type="button"
                          aria-label="Play video"
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => setVideoId(ytId)}
                          className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.6)] transition-colors hover:bg-blue-600 md:bottom-5 md:left-5 md:h-14 md:w-14"
                        >
                          <Play className="h-5 w-5 fill-current md:h-6 md:w-6" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: quote */}
                  <div className="flex flex-col gap-6">
                    <Quote
                      className="h-9 w-9 -scale-x-100 text-blue-400"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <Typography variant="lead" tone="muted">
                      &ldquo;{item.quote}&rdquo;
                    </Typography>
                    <div className="h-px w-16 bg-blue-300" />
                    <div className="flex flex-col gap-1">
                      <Typography variant="h5" as="p">
                        {item.authorName}
                      </Typography>
                      <Typography variant="body-sm" tone="muted">
                        {item.authorTitle}
                      </Typography>
                    </div>
                    <a
                      href={item.linkHref}
                      tabIndex={isActive ? 0 : -1}
                      className="inline-flex items-center gap-1 self-start text-blue-600 hover:text-blue-700"
                    >
                      <Typography
                        as="span"
                        variant="body-sm"
                        weight="medium"
                        tone="inherit"
                      >
                        {item.linkLabel}
                      </Typography>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Pagination dots ─────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-center gap-2 md:justify-end md:pr-12 lg:pr-20">
          {dict.items.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`${i + 1} / ${total}`}
                aria-current={isActive ? 'true' : undefined}
                className={`h-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'w-6 bg-blue-500'
                    : 'w-2 bg-blue-200 hover:bg-blue-300'
                }`}
              />
            );
          })}
        </div>
      </Container>

      {/* ── YouTube popup ─────────────────────────────────────────── */}
      {videoId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          onClick={() => setVideoId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setVideoId(null)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
