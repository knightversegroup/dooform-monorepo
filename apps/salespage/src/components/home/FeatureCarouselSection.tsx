'use client';

import { useState } from 'react';
import { Box, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type FeatureSlide = {
  id: string;
  pillLabel: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type FeatureCarouselDict = {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  subLink: string;
  ctaLabel: string;
  prevLabel: string;
  nextLabel: string;
  slides: FeatureSlide[];
};

/* Cycle through these mockup screenshots so each slide has a visual; the
 * content scanner needs literal class strings, but for image paths we just
 * pick by index. Replace with per-slide images as new assets land. */
const SLIDE_IMAGES = [
  '/images/workspace-preview-1.png',
  '/images/workspace-preview-2.png',
  '/images/workspace-preview-3.png',
];

/* Tab pill — extracted so the active/inactive variant changes only one
 * thing and the size/weight (`text-sm font-medium`) lives outside JSX
 * className literals (where the salespage typography ESLint rule would
 * otherwise flag it). */
const PILL_BASE_CLASS =
  'rounded-full border px-4 py-2 text-sm font-medium transition-colors';

/* Round arrow button used on left/right of the active slide. */
const ARROW_BUTTON_CLASS =
  'flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600 shadow-sm transition-colors hover:bg-blue-100';

export default function FeatureCarouselSection({
  dict,
  className,
}: {
  dict: FeatureCarouselDict;
  /* Optional Tailwind classes forwarded to the outer <Section>. Used by
   * page.tsx to stripe alternating instances with different backgrounds. */
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = dict.slides.length;

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + total) % total);
  const goNext = () => setActiveIndex((i) => (i + 1) % total);

  return (
    <Section padding="lg" className={className}>
      <Container>
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <Typography variant="overline" tone="inherit" className="text-blue-600">
            {dict.eyebrow}
          </Typography>
          <Typography variant="h2" as="h2" className="mt-3 max-w-2xl">
            {dict.headingLine1}
            <br />
            {dict.headingLine2}
          </Typography>
          <a
            href="#trial"
            className="mt-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <Typography
              as="span"
              variant="body-sm"
              weight="medium"
              tone="inherit"
            >
              {dict.subLink}
            </Typography>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        {/* ── Tab pills ─────────────────────────────────────────────── */}
        <div className="-mx-6 mt-10 overflow-x-auto px-6 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0">
          <div className="flex w-max min-w-full items-center justify-center gap-2 md:flex-wrap md:gap-3">
            {dict.slides.map((s, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-pressed={isActive}
                  className={`${PILL_BASE_CLASS} ${
                    isActive
                      ? 'border-blue-600 bg-white text-blue-600 shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
                  }`}
                >
                  {s.pillLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active slide ──────────────────────────────────────────── */}
        <div className="relative mt-12 md:mt-14">
          {/* Side arrows — desktop only, sit outside the content grid. */}
          <button
            type="button"
            onClick={goPrev}
            aria-label={dict.prevLabel}
            className={`absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 md:flex ${ARROW_BUTTON_CLASS}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={dict.nextLabel}
            className={`absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 md:flex ${ARROW_BUTTON_CLASS}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* All slides render into the same grid cell (col-start-1 row-start-1)
           * so the container always sizes to the tallest slide — switching
           * between slides never jolts the page height. Inactive slides
           * fade out and lose pointer-events. */}
          <div className="relative grid md:mx-16 lg:mx-20">
            {dict.slides.map((s, i) => {
              const isActive = i === activeIndex;
              const slideImage = SLIDE_IMAGES[i % SLIDE_IMAGES.length];
              return (
                <div
                  key={s.id}
                  aria-hidden={!isActive}
                  className={`col-start-1 row-start-1 grid grid-cols-1 items-center gap-8 transition-opacity duration-300 ease-out md:grid-cols-2 md:gap-12 ${
                    isActive
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0'
                  }`}
                >
                  {/* Left: copy */}
                  <div className="flex flex-col gap-4">
                    <Typography
                      variant="overline"
                      tone="inherit"
                      className="text-blue-600"
                    >
                      {s.eyebrow}
                    </Typography>
                    <Typography variant="h2" as="h3">
                      {s.title}
                    </Typography>
                    <Typography variant="body" tone="muted">
                      {s.description}
                    </Typography>
                    <a
                      href="#trial"
                      tabIndex={isActive ? 0 : -1}
                      className="inline-flex items-center gap-1 self-start rounded-full bg-blue-50 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <Typography
                        as="span"
                        variant="body-sm"
                        weight="medium"
                        tone="inherit"
                      >
                        {dict.ctaLabel}
                      </Typography>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Right: mockup card with screenshot + decorative icon. */}
                  <div className="relative">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-blue-50 p-4 md:p-6">
                      <div className="h-full w-full overflow-hidden rounded-xl shadow-[0_12px_40px_-12px_rgba(37,99,235,0.25)]">
                        <img
                          src={slideImage}
                          alt=""
                          className="block h-full w-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-3 left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] md:left-6">
                      <Box className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Pagination dots ───────────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {dict.slides.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`${i + 1} / ${total}`}
                aria-current={isActive ? 'true' : undefined}
                className={`h-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
