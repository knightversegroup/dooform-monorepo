'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { Typography } from '@dooform/ui';

export type ComparisonRow = {
  feature: string;
  description?: string;
  values: (boolean | string)[];
};

export type ComparisonSection = {
  name: string;
  rows: ComparisonRow[];
};

export type ComparisonDict = {
  heading: string;
  columns: string[];
  sections: ComparisonSection[];
};

/* Per-plan accent dots used next to the column headers. The dooform-salespage
 * uses two-dot patterns for the Pro/Advance tiers to suggest progression. */
const PLAN_DOTS: Record<number, string[]> = {
  0: ['bg-gray-400'],
  1: ['bg-blue-500'],
  2: ['bg-amber-400', 'bg-orange-500'],
  3: ['bg-neutral-700', 'bg-neutral-900'],
};

function PlanDots({ index }: { index: number }) {
  const colors = PLAN_DOTS[index] ?? ['bg-gray-400'];
  return (
    <span className="ml-2 inline-flex gap-0.5 align-middle">
      {colors.map((color, i) => (
        <span
          key={i}
          className={`inline-block h-3 w-3 rounded-full ${color}`}
        />
      ))}
    </span>
  );
}

/* Category-pill class shared across the filter row. Kept as a constant so the
 * `text-sm font-medium` size/weight (single text element) is scoped to one
 * place rather than scattered through JSX. */
const PILL_BASE_CLASS =
  'rounded-full border px-5 py-2 text-sm font-medium transition-colors';

export default function PlanComparison({ dict }: { dict: ComparisonDict }) {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  /* Track which section is in view via IntersectionObserver. The negative
   * top margin accounts for the sticky header + pill row above the table. */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(index);
          }
        },
        { rootMargin: '-250px 0px -60% 0px' },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [dict.sections.length]);

  const scrollToSection = (index: number) => {
    setActiveSection(index);
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <Typography variant="h2" align="center" className="mb-10">
          {dict.heading}
        </Typography>

        {/* Sticky block: pills + section/tier header. Top offset matches the
         * salespage's sticky <SiteHeader> (h-16 = 64px). */}
        <div className="sticky top-16 z-10 bg-white">
          <div className="flex flex-wrap justify-center gap-2 pb-8 pt-8">
            {dict.sections.map((section, index) => (
              <button
                key={section.name}
                onClick={() => scrollToSection(index)}
                className={`${PILL_BASE_CLASS} ${
                  activeSection === index
                    ? 'border-[#262626] bg-[#262626] text-white'
                    : 'border-[#d4d4d4] bg-white text-[#262626] hover:bg-[#f5f5f5]'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Section name + tier names on the same line */}
          <div className="flex items-end border-b border-[#e5e5e5] pb-4">
            <div className="w-[28%] shrink-0">
              <Typography as="span" variant="h5" weight="bold">
                {dict.sections[activeSection]?.name}
              </Typography>
            </div>
            {dict.columns.map((col, colIndex) => (
              <div key={col} className="flex-1 text-center">
                <Typography as="span" variant="body" weight="semibold">
                  {col}
                </Typography>
                <PlanDots index={colIndex} />
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="md:overflow-x-visible">
          <table className="w-full min-w-[700px] border-collapse">
            <colgroup>
              <col style={{ width: '28%' }} />
              {dict.columns.map((col) => (
                <col
                  key={col}
                  style={{ width: `${72 / dict.columns.length}%` }}
                />
              ))}
            </colgroup>
            {dict.sections.map((section, sectionIndex) => (
              <tbody key={section.name}>
                {/* Anchor row for IntersectionObserver / scroll-target. */}
                <tr
                  ref={(el) => {
                    sectionRefs.current[sectionIndex] = el;
                  }}
                  className="scroll-mt-[280px]"
                >
                  <td colSpan={dict.columns.length + 1} className="pt-4" />
                </tr>

                {section.rows.map((row) => {
                  const allSame =
                    row.values.every((v) => v === row.values[0]) &&
                    typeof row.values[0] === 'string';

                  return (
                    <tr key={row.feature} className="border-b border-[#f0f0f0]">
                      <td className="py-4 pr-6 align-top">
                        <Typography variant="body" weight="medium" tone="heading">
                          {row.feature}
                        </Typography>
                        {row.description && (
                          <Typography variant="caption" tone="inherit" className="mt-0.5 text-[#888]">
                            {row.description}
                          </Typography>
                        )}
                      </td>
                      {allSame ? (
                        <td
                          colSpan={dict.columns.length}
                          className="py-4 text-center"
                        >
                          <Typography as="span" variant="body-sm" tone="heading">
                            {row.values[0] as string}
                          </Typography>
                        </td>
                      ) : (
                        row.values.map((value, i) => (
                          <td key={i} className="py-4 text-center align-top">
                            {value === true ? (
                              <Check className="mx-auto h-4 w-4 text-[#262626]" />
                            ) : value === false ? (
                              <Minus className="mx-auto h-4 w-4 text-[#ccc]" />
                            ) : (
                              <Typography as="span" variant="body-sm" tone="heading">
                                {value}
                              </Typography>
                            )}
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </section>
  );
}
