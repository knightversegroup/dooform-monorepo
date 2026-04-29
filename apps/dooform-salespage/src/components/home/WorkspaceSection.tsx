import { ArrowRight } from 'lucide-react';
import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type WorkspaceCardDict = {
  label: string;
  tagline: string;
};

export type WorkspaceDict = {
  heading: string;
  cards: {
    docs: WorkspaceCardDict;
    knowledgeBase: WorkspaceCardDict;
    projects: WorkspaceCardDict;
  };
};

/* ── Decorative mockup illustrations ── */

function DocsMockup() {
  return (
    <div className="flex gap-3">
      {/* Left card: H1 Planning */}
      <div className="flex-1 overflow-hidden rounded-lg border border-[#e5e0da] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0d4b3b]">
            <span className="text-xs font-bold text-white">H</span>
          </div>
          <span className="text-sm font-semibold text-[#262626]">
            H1 Planning
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2 w-3/4 rounded bg-[#e5e0da]" />
          <div className="h-2 w-full rounded bg-[#f0ece6]" />
          <div className="h-2 w-5/6 rounded bg-[#f0ece6]" />
        </div>
        <div className="mt-3 text-[10px] font-medium text-[#999]">
          Overview
        </div>
        <div className="mt-1 space-y-1.5">
          <div className="h-1.5 w-full rounded bg-[#f0ece6]" />
          <div className="h-1.5 w-4/5 rounded bg-[#f0ece6]" />
          <div className="h-1.5 w-3/4 rounded bg-[#f0ece6]" />
        </div>
        {/* Calendar mini */}
        <div className="mt-3 rounded border border-[#f0ece6] p-2">
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-sm ${i === 9 ? 'bg-[#0d4b3b]' : 'bg-[#f5f0ea]'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right card: Help Center */}
      <div className="flex-1 overflow-hidden rounded-lg border border-[#e5e0da] bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-[#262626]">
          Help Center Revamp
        </div>
        <div className="mt-2 flex gap-1">
          <span className="rounded-full bg-[#e8f5e9] px-2 py-0.5 text-[9px] text-[#2e7d32]">
            In progress
          </span>
          <span className="rounded-full bg-[#e3f2fd] px-2 py-0.5 text-[9px] text-[#1565c0]">
            Planning
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-3 w-3 rounded-full border-2 border-[#ccc]" />
            <div className="h-2 w-3/4 rounded bg-[#f0ece6]" />
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-3 w-3 rounded-full border-2 border-[#ccc]" />
            <div className="h-2 w-full rounded bg-[#f0ece6]" />
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-3 w-3 rounded-full border-2 border-[#4caf50] bg-[#4caf50]" />
            <div className="h-2 w-2/3 rounded bg-[#f0ece6]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeBaseMockup() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e0da] bg-white p-5 shadow-sm">
      <div className="text-base font-semibold text-[#262626]">Company HQ</div>
      <div className="mt-1 space-y-1">
        <div className="h-1.5 w-full rounded bg-[#f0ece6]" />
        <div className="h-1.5 w-4/5 rounded bg-[#f0ece6]" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Company section */}
        <div>
          <div className="text-xs font-semibold text-[#262626]">Company</div>
          <ul className="mt-2 space-y-1.5">
            {['Meetings', 'Docs', 'Projects', 'Tasks', 'Teams & Org Chart'].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-[10px] text-[#737373]"
                >
                  <span className="text-[#0d4b3b]">✓</span> {item}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Resources section */}
        <div>
          <div className="text-xs font-semibold text-[#262626]">Resources</div>
          <ul className="mt-2 space-y-1.5">
            {['Company Holidays', 'Relocation Guidelines', 'Vendor Review'].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-[10px] text-[#737373]"
                >
                  <span className="text-[#0d4b3b]">✓</span> {item}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProjectsMockup() {
  return (
    <div className="flex gap-3">
      {/* Final QA card */}
      <div className="flex-1 overflow-hidden rounded-lg border border-[#e5e0da] bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-[#262626]">Final QA</div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border-2 border-[#4caf50] bg-[#4caf50]" />
            <div className="h-2 w-3/4 rounded bg-[#f0ece6]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border-2 border-[#4caf50] bg-[#4caf50]" />
            <div className="h-2 w-2/3 rounded bg-[#f0ece6]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border-2 border-[#ccc]" />
            <div className="h-2 w-4/5 rounded bg-[#f0ece6]" />
          </div>
        </div>
      </div>

      {/* Launch tracker card */}
      <div className="flex-1 overflow-hidden rounded-lg border border-[#e5e0da] bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-[#262626]">
          Launch tracker
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {/* Timeline dots */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0d4b3b]" />
            <div className="h-1.5 w-full rounded bg-[#e8f5e9]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0d4b3b]" />
            <div className="h-1.5 w-4/5 rounded bg-[#e8f5e9]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#ccc]" />
            <div className="h-1.5 w-3/5 rounded bg-[#f0ece6]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#ccc]" />
            <div className="h-1.5 w-2/3 rounded bg-[#f0ece6]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main section ── */

const cards = [
  { key: 'docs' as const, Mockup: DocsMockup, bg: 'bg-[#f5f0ea]' },
  {
    key: 'knowledgeBase' as const,
    Mockup: KnowledgeBaseMockup,
    bg: 'bg-[#f5f0ea]',
  },
  { key: 'projects' as const, Mockup: ProjectsMockup, bg: 'bg-[#f5f0ea]' },
];

export default function WorkspaceSection({ dict }: { dict: WorkspaceDict }) {
  return (
    <Section padding="lg">
      <Container>
        <Typography variant="h2" className="mb-10 md:mb-14">
          {dict.heading}
        </Typography>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map(({ key, Mockup, bg }) => {
            const card = dict.cards[key];
            const isLast = key === 'projects';

            return (
              <div
                key={key}
                className={`flex min-h-[400px] flex-col gap-4 overflow-hidden rounded-2xl p-6 md:p-8 ${bg} ${isLast ? 'md:col-span-2' : ''}`}
              >
                {/* Label + arrow */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                      {card.label}
                    </span>
                    <p className="mt-1 text-lg font-semibold text-[#262626]">
                      {card.tagline}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d4b3b]">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </div>

                {/* Mockup illustration */}
                <div className="mt-auto">
                  <Mockup />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
