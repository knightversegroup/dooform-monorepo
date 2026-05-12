'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqDict = {
  heading: string;
  subtitle: string;
  viewDocuments: string;
  readMore: string;
  items: FaqItem[];
};

export default function FaqSection({
  dict,
}: {
  dict: FaqDict;
  /* `locale` is kept for backwards compatibility with the page layout
   * but is no longer rendered — the simplified card layout drops the
   * locale-aware CTA buttons. */
  locale?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section padding="lg">
      <Container>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <Typography variant="h2" as="h2">
            {dict.heading}
          </Typography>
        </div>

        {/* ── Accordion ───────────────────────────────────────────── */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 md:mt-14">
          {dict.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)] ring-1 ring-slate-100"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <Typography
                    as="span"
                    variant="body"
                    weight="medium"
                    tone="inherit"
                    className="text-slate-900"
                  >
                    {item.question}
                  </Typography>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <Typography
                      variant="body-sm"
                      tone="muted"
                      className="px-6 pb-5"
                    >
                      {item.answer}
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
