'use client';

import { useState } from 'react';

const items = [
  {
    title: 'A form intelligence layer',
    body: 'Dooform collects, validates, and structures all your form data in one place -- so you can build quicker, convert more, onboard faster and find the answers you need, when you need them.',
  },
  {
    title: 'Data in, Insights out',
    body: 'Our integrations let you import external content from CRMs, spreadsheets, and more to keep data centralized. The result? A high-quality data loop that fuels both people and automation.',
  },
  {
    title: 'Customization to suit you',
    body: 'Dooform adapts to how you work. Start with templates, enrich with custom logic, or automate management as you grow. Forms that adapt alongside you.',
  },
  {
    title: 'Safe, secure and always private',
    body: 'Sensitive information doesn\'t belong in leaky systems. Dooform protects your data with enterprise-grade security. And we never share your proprietary data, either.',
  },
];

export default function AccordionFeatures() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm text-gray-500">Dooform</p>
        <h2 className="mb-12 max-w-lg text-3xl font-bold leading-snug tracking-tight text-gray-900">
          Where great design meets reliable data
        </h2>

        <div className="flex gap-0 bg-gray-100 md:flex-col">
          {/* Left: Accordion */}
          <div className="flex flex-1 flex-col">
            {items.map((item, idx) => (
              <div key={item.title} className="flex flex-col">
                {idx > 0 && <div className="mx-4 border-t border-gray-300" />}
                <h3>
                  <button
                    onClick={() => setOpenIndex(idx)}
                    className="flex w-full items-center justify-between p-4 text-left font-semibold text-gray-900 transition hover:bg-gray-200"
                  >
                    {item.title}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 shrink-0 transition ${openIndex === idx ? 'rotate-180' : ''}`}
                      fill="currentColor"
                    >
                      <path d="M11.06 14.25 9.31 12.5 2.03 5.22l-.53-.53L.44 5.75l.53.53 8.5 8.5.53.53zm7.97-7.97.53-.53-1.06-1.06-.53.53-6.91 6.91 1.06 1.06z" />
                    </svg>
                  </button>
                </h3>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openIndex === idx ? '200px' : '0px' }}
                >
                  <div className="px-4 pb-4">
                    <p className="pt-2 font-light text-gray-700">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Image placeholder */}
          <div className="flex flex-1 items-center justify-center md:order-first">
            <div className="flex aspect-square w-full items-center justify-center bg-gray-200 text-sm text-gray-400">
              Product Screenshot
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
