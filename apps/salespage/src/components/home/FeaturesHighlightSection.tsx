'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Eye,
  FileText,
  Pencil,
  Share2,
} from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type FeatureHighlightCard = {
  eyebrow: string;
  title: string;
  description: string;
};

export type FeaturesHighlightDict = {
  badge: string;
  heading: string;
  subtitle: string;
  cards: {
    card1: FeatureHighlightCard;
    card2: FeatureHighlightCard;
  };
};

/* Console design tokens, mirrored from apps/console/tailwind.config.js so the
 * mockups read as the real product. Kept as constants because Tailwind needs
 * literal class names — these are referenced via interpolation only at the
 * call site, but written as full class strings below. */

/* ── Hooks ─────────────────────────────────────────────────────────── */

function useInViewOnce<T extends HTMLElement>(rootMargin = '-80px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
}

function useCountUp(target: number, durationMs: number, start: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, start]);

  return value;
}

/* ── Card 1: DocumentsPage table mockup ────────────────────────────── */

type Lifecycle = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'SIGNED';

const LIFECYCLE_BADGE: Record<Lifecycle, { cls: string; label: string }> = {
  DRAFT:     { cls: 'bg-gray-100 text-gray-700',     label: 'DRAFT' },
  IN_REVIEW: { cls: 'bg-yellow-100 text-yellow-700', label: 'IN REVIEW' },
  APPROVED:  { cls: 'bg-blue-100 text-blue-700',     label: 'APPROVED' },
  SIGNED:    { cls: 'bg-green-100 text-green-700',   label: 'SIGNED' },
};

const TABLE_ROWS: { name: string; lifecycle: Lifecycle; created: string }[] = [
  { name: 'Birth_Certificate_TH-EN', lifecycle: 'SIGNED',    created: 'Today, 10:24' },
  { name: 'Visa_Application_2026',   lifecycle: 'APPROVED',  created: 'Today, 09:11' },
  { name: 'House_Registration',      lifecycle: 'IN_REVIEW', created: 'Yesterday' },
  { name: 'ID_Card_Translation',     lifecycle: 'DRAFT',     created: '2 days ago' },
];

const SCOPE_TABS = ['All', 'My documents', 'Shared with me'] as const;

function DocumentsTablePreview({ active }: { active: boolean }) {
  const total = useCountUp(1248, 1500, active);

  return (
    <div className="overflow-hidden rounded-md border border-[#e6e6e6] bg-white font-sans text-[13px] text-[#0f0f10] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Page header */}
      <div className="border-b border-[#e6e6e6] px-4 pb-3 pt-4">
        <Typography as="span" variant="body-sm" weight="semibold" tone="inherit" className="block text-[#0f0f10]">
          Documents
        </Typography>
        <Typography as="span" variant="caption" tone="inherit" className="block text-[#6b7280]">
          Documents you own or shared
        </Typography>
      </div>

      {/* Scope tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-[#e6e6e6] px-4 py-3">
        <div className="inline-flex overflow-hidden rounded-md border border-[#e6e6e6]">
          {SCOPE_TABS.map((label, i) => (
            <Typography
              as="span"
              key={label}
              variant="caption"
              weight="medium"
              tone="inherit"
              className={`px-3 py-1 ${
                i === 0
                  ? 'bg-[#5e6ad2] text-white'
                  : 'bg-white text-[#3f3f46]'
              } ${i > 0 ? 'border-l border-[#e6e6e6]' : ''}`}
            >
              {label}
            </Typography>
          ))}
        </div>
        <Typography as="span" variant="caption" tone="inherit" className="text-[#6b7280]">
          Lifecycle: All states
        </Typography>
      </div>

      {/* Table */}
      <div className="bg-[#f4f4f5]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-2">
          <Typography as="span" variant="caption" weight="medium" tone="inherit" className="text-[#6b7280]">
            Document
          </Typography>
          <Typography as="span" variant="caption" weight="medium" tone="inherit" className="text-[#6b7280]">
            Lifecycle
          </Typography>
          <Typography as="span" variant="caption" weight="medium" tone="inherit" className="text-[#6b7280]">
            Created
          </Typography>
        </div>
      </div>

      <div className="divide-y divide-[#e6e6e6] bg-white">
        {TABLE_ROWS.map((row, i) => {
          const badge = LIFECYCLE_BADGE[row.lifecycle];
          return (
            <div
              key={row.name}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 transition-all duration-500 ease-out"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? 'translateY(0)' : 'translateY(8px)',
                transitionDelay: `${i * 130}ms`,
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
                <Typography
                  as="span"
                  variant="caption"
                  weight="medium"
                  tone="inherit"
                  className="truncate text-[#5e6ad2]"
                >
                  {row.name}
                </Typography>
              </div>
              <span
                className={`rounded px-2 py-0.5 ${badge.cls}`}
              >
                <Typography as="span" variant="micro" weight="medium" tone="inherit" className="uppercase [letter-spacing:0.05em]">
                  {badge.label}
                </Typography>
              </span>
              <Typography as="span" variant="caption" tone="inherit" className="whitespace-nowrap text-[#6b7280]">
                {row.created}
              </Typography>
            </div>
          );
        })}
      </div>

      {/* Footer counter */}
      <div className="flex items-center justify-between border-t border-[#e6e6e6] bg-[#fafafa] px-4 py-2.5">
        <Typography as="span" variant="caption" tone="inherit" className="text-[#6b7280] tabular-nums">
          Page 1 of 63 · {total.toLocaleString('en-US')} total
        </Typography>
        <div className="flex gap-1.5">
          <span className="rounded border border-[#d4d4d4] bg-white px-2 py-0.5">
            <Typography as="span" variant="caption" tone="inherit" className="text-[#6b7280]">
              ‹
            </Typography>
          </span>
          <span className="rounded border border-[#d4d4d4] bg-white px-2 py-0.5">
            <Typography as="span" variant="caption" tone="inherit" className="text-[#6b7280]">
              ›
            </Typography>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Card 2: DocumentDetailPage with LifecycleBar ──────────────────── */

const LIFECYCLE_STAGES: { key: Lifecycle; label: string }[] = [
  { key: 'DRAFT',     label: 'Draft' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'APPROVED',  label: 'Approved' },
  { key: 'SIGNED',    label: 'Signed' },
];

const DETAIL_TABS = ['Preview', 'Data', 'Activity'] as const;

function DocumentDetailPreview({ active }: { active: boolean }) {
  /* Step the lifecycle bar through stages 0 → 3 (SIGNED) once on activation. */
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < LIFECYCLE_STAGES.length) {
        setStageIndex(i);
      } else {
        clearInterval(handle);
      }
    };
    const handle = setInterval(tick, 550);
    return () => clearInterval(handle);
  }, [active]);

  return (
    <div className="overflow-hidden rounded-md border border-[#e6e6e6] bg-white font-sans text-[13px] text-[#0f0f10] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Page header */}
      <div className="border-b border-[#e6e6e6] px-4 pb-3 pt-4">
        <div className="flex items-center gap-1 text-[#6b7280]">
          <ChevronLeft className="h-3.5 w-3.5" />
          <Typography as="span" variant="caption" tone="inherit" className="text-[#6b7280]">
            Back to Documents
          </Typography>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <Typography as="span" variant="body-sm" weight="semibold" tone="inherit" className="truncate text-[#0f0f10]">
            Birth_Certificate_TH-EN
          </Typography>
          <div className="flex shrink-0 gap-1.5">
            <ActionPill icon={Share2} label="Share" />
            <ActionPill icon={Pencil} label="Edit" filled />
          </div>
        </div>
      </div>

      {/* Lifecycle bar — stages activate in sequence on scroll-in. */}
      <div className="px-4 pb-3 pt-4">
        <ol className="flex w-full items-stretch gap-0">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const reached = idx <= stageIndex;
            const isActive = idx === stageIndex;
            return (
              <li
                key={stage.key}
                className={`flex flex-1 items-center gap-1.5 border-y border-r border-[#d4d4d4] px-2 py-1.5 first:rounded-l-md first:border-l last:rounded-r-md ${
                  isActive
                    ? 'border-[#5e6ad2] bg-[#5e6ad2] text-white'
                    : reached
                    ? 'border-[#5e6ad2]/30 bg-[#f0f1fb] text-[#5e6ad2]'
                    : 'bg-white text-[#6b7280]'
                }`}
                style={{
                  transition:
                    'background-color 350ms ease-out, color 350ms ease-out, border-color 350ms ease-out',
                }}
              >
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isActive
                      ? 'border-white bg-white text-[#5e6ad2]'
                      : reached
                      ? 'border-[#5e6ad2] bg-[#5e6ad2] text-white'
                      : 'border-[#d4d4d4]'
                  }`}
                  style={{
                    transition:
                      'background-color 350ms ease-out, color 350ms ease-out, border-color 350ms ease-out',
                  }}
                >
                  {reached && !isActive ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : (
                    <Typography as="span" variant="micro" weight="medium" tone="inherit">
                      {idx + 1}
                    </Typography>
                  )}
                </span>
                <Typography as="span" variant="micro" weight="medium" tone="inherit" className="truncate">
                  {stage.label}
                </Typography>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e6e6e6] px-4">
        {DETAIL_TABS.map((label, i) => (
          <Typography
            as="span"
            key={label}
            variant="caption"
            weight="medium"
            tone="inherit"
            className={`-mb-px border-b-2 px-2.5 py-2 ${
              i === 0
                ? 'border-[#5e6ad2] text-[#0f0f10]'
                : 'border-transparent text-[#6b7280]'
            }`}
          >
            {label}
          </Typography>
        ))}
      </div>

      {/* Preview placeholder */}
      <div className="p-4">
        <div className="overflow-hidden rounded border border-[#e6e6e6] bg-[#fafafa]">
          <div className="flex items-center gap-1.5 border-b border-[#e6e6e6] bg-white px-3 py-1.5">
            <Eye className="h-3 w-3 text-[#6b7280]" />
            <Typography as="span" variant="micro" weight="medium" tone="inherit" className="text-[#6b7280] uppercase [letter-spacing:0.05em]">
              PDF Preview
            </Typography>
          </div>
          <div className="space-y-1.5 p-4">
            {[100, 92, 96, 70, 88, 60].map((w, i) => (
              <div
                key={i}
                className="h-1.5 rounded bg-[#e6e6e6]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionPill({
  icon: Icon,
  label,
  filled = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  filled?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
        filled
          ? 'border-[#5e6ad2] bg-[#5e6ad2] text-white'
          : 'border-[#d4d4d4] bg-white text-[#3f3f46]'
      }`}
    >
      <Icon className="h-3 w-3" />
      <Typography as="span" variant="micro" weight="medium" tone="inherit">
        {label}
      </Typography>
    </span>
  );
}

/* ── Main section ──────────────────────────────────────────────────── */

export default function FeaturesHighlightSection({
  dict,
}: {
  dict: FeaturesHighlightDict;
}) {
  const [gridRef, inView] = useInViewOnce<HTMLDivElement>('-100px');
  const cards = [
    { key: 'card1' as const, content: dict.cards.card1, Preview: DocumentsTablePreview },
    { key: 'card2' as const, content: dict.cards.card2, Preview: DocumentDetailPreview },
  ];

  return (
    <Section padding="lg">
      <Container>
        <div className="mb-6 flex justify-center">
          <Typography
            as="span"
            variant="body-sm"
            weight="medium"
            tone="muted"
            className="rounded-full border border-[#e5e0da] bg-white px-5 py-2 shadow-sm"
          >
            {dict.badge}
          </Typography>
        </div>

        <Typography variant="h2" className="text-center">
          {dict.heading}
        </Typography>
        <Typography
          variant="body"
          className="mx-auto mt-4 max-w-xl text-center"
        >
          {dict.subtitle}
        </Typography>

        <div
          ref={gridRef}
          className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2"
        >
          {cards.map(({ key, content, Preview }) => (
            <div
              key={key}
              className="flex flex-col overflow-hidden rounded-2xl bg-[#f5f0ea]"
            >
              <div className="p-6 md:p-8">
                <Typography variant="overline" as="span">
                  {content.eyebrow}
                </Typography>
                <Typography variant="h2" as="h3" className="mt-2">
                  {content.title}
                </Typography>
                <Typography variant="lead" className="mt-3">
                  {content.description}
                </Typography>
              </div>

              <div className="mt-auto px-6 pb-6 md:px-8 md:pb-8">
                <Preview active={inView} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
