'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import type { ComparisonDict } from './PlanCards';

const PLAN_COLORS: Record<number, string[]> = {
  0: ['bg-gray-400'],
  1: ['bg-blue-500'],
  2: ['bg-amber-400', 'bg-orange-500'],
  3: ['bg-neutral-700', 'bg-neutral-900'],
};

function PlanDots({ index }: { index: number }) {
  const colors = PLAN_COLORS[index] ?? ['bg-gray-400'];
  return (
    <span className="ml-2 inline-flex gap-0.5">
      {colors.map((color, i) => (
        <span
          key={i}
          className={`inline-block h-3 w-3 rounded-full ${color}`}
        />
      ))}
    </span>
  );
}

export default function PlanComparison({ dict }: { dict: ComparisonDict }) {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Track which section is in view
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
        {/* Heading */}
        <h2 className="mb-10 text-center text-4xl font-bold text-[#262626]">
          {dict.heading}
        </h2>

        {/* Sticky block: pills + section/tier header */}
        <div ref={stickyRef} className="sticky top-[73px] z-10 bg-white">
          {/* Category filter pills */}
          <div className="flex flex-wrap justify-center gap-2 pb-8 pt-8">
            {dict.sections.map((section, index) => (
              <button
                key={section.name}
                onClick={() => scrollToSection(index)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
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
            <div className="w-[28%] shrink-0 text-lg font-bold text-[#262626]">
              {dict.sections[activeSection]?.name}
            </div>
            {dict.columns.map((col, colIndex) => (
              <div
                key={col}
                className="flex-1 text-center text-base font-semibold text-[#262626]"
              >
                {col}
                <PlanDots index={colIndex} />
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table body */}
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
                {/* Section anchor for scroll tracking */}
                <tr
                  ref={(el) => {
                    sectionRefs.current[sectionIndex] = el;
                  }}
                  className="scroll-mt-[280px]"
                >
                  <td colSpan={dict.columns.length + 1} className="pt-4" />
                </tr>

                {/* Feature rows */}
                {section.rows.map((row) => {
                  const allSame =
                    row.values.every((v) => v === row.values[0]) &&
                    typeof row.values[0] === 'string';

                  return (
                    <tr key={row.feature} className="border-b border-[#f0f0f0]">
                      <td className="py-4 pr-6">
                        <div className="font-medium text-[#262626]">
                          {row.feature}
                        </div>
                        {row.description && (
                          <div className="mt-0.5 text-xs text-[#888]">
                            {row.description}
                          </div>
                        )}
                      </td>
                      {allSame ? (
                        <td
                          colSpan={dict.columns.length}
                          className="py-4 text-center text-sm text-[#262626]"
                        >
                          {row.values[0] as string}
                        </td>
                      ) : (
                        row.values.map((value, i) => (
                          <td key={i} className="py-4 text-center">
                            {value === true ? (
                              <Check className="mx-auto h-4 w-4 text-[#262626]" />
                            ) : value === false ? (
                              <Minus className="mx-auto h-4 w-4 text-[#ccc]" />
                            ) : (
                              <span className="text-sm text-[#262626]">
                                {value}
                              </span>
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
