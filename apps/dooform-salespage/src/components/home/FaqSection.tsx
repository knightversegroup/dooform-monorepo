'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

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
  locale,
}: {
  dict: FaqDict;
  locale: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section padding="none">
      <Container className="flex flex-col gap-9 py-9 md:flex-row md:items-start">
        {/* Left Column */}
        <div className="shrink-0 md:w-[389px]">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[#262626]">
                {dict.heading}
              </h2>
              <p className="mt-0.5 text-base text-[#262626]">
                {dict.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="dark" size="sm" href={`/${locale}/documents`}>
                {dict.viewDocuments}
              </Button>
              <Button variant="ghost" size="sm" href="#">
                {dict.readMore}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column — Accordion */}
        <div className="flex min-w-0 flex-1 flex-col">
          {dict.items.map((item, index) => (
            <div
              key={index}
              className="border-b-[1.5px] border-[#d4cec4]"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-base text-black">{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-black transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-3 pb-3 text-sm text-[#737373]">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
