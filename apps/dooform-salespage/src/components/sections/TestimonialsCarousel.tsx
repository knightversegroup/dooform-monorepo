'use client';

import { useState } from 'react';

const quotes = [
  {
    text: 'Dooform has completely transformed how we collect customer feedback. The forms are beautiful and the analytics are incredibly useful for our entire team.',
    name: 'Sarah Chen',
    title: 'Product Manager',
    company: 'TechCorp',
  },
  {
    text: 'If you need a form, if you have some data to collect, instead of overwhelming everyone on Slack or email, there\'s a form. It\'s created, someone monitors responses, and this has improved productivity across the board.',
    name: 'Eddie Flaiser',
    title: 'Head of Engineering',
    company: 'CloudBase',
  },
  {
    text: 'We switched from our old form builder and saw a 40% increase in completion rates. The drag and drop builder is a game changer for our marketing team.',
    name: 'James Wilson',
    title: 'Marketing Lead',
    company: 'GrowthCo',
  },
  {
    text: 'The integrations work flawlessly. We pipe everything directly into our CRM and it just works. Dooform saves us time on a day to day basis.',
    name: 'Maria Garcia',
    title: 'Operations Director',
    company: 'ScaleUp Inc',
  },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#0a1628] py-16 text-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Controls */}
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2">
          <button
            onClick={() => setCurrent((c) => (c - 1 + quotes.length) % quotes.length)}
            className="bg-gray-700 p-2 text-white transition hover:bg-orange-500"
            aria-label="Previous testimonial"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="m10.77 16.2-1.04 1.1L4.2 12h2.17zm0-12.91L4.91 9H18v1.5H2.63l-.15-.14-.56-.54.56-.54 7.25-7.07z" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % quotes.length)}
            className="bg-gray-700 p-2 text-white transition hover:bg-orange-500"
            aria-label="Next testimonial"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="m17.52 9.28.56.54-.56.54-7.25 6.93-1.04-1.08 5.97-5.71H2V9h15.24zM15.7 7.5h-2.15L9.23 3.29l1.04-1.08z" />
            </svg>
          </button>
          <div className="ml-2 flex items-center bg-blue-900 px-3 py-1 text-sm text-blue-200">
            {current + 1} / {quotes.length}
          </div>
          {/* Progress bar */}
          <div className="ml-4 w-24 bg-white">
            <div
              className="h-1.5 bg-orange-500 transition-all"
              style={{ width: `${((current + 1) / quotes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quote */}
        <div className="pb-16 pr-6">
          <blockquote className="flex gap-16 md:flex-col">
            <p className="flex-[2] text-2xl font-light leading-relaxed lg:text-3xl">
              {quotes[current].text}
            </p>
            <cite className="flex-1 not-italic">
              <div className="font-bold">{quotes[current].name}</div>
              <div className="mb-6 text-sm text-gray-400">{quotes[current].title}</div>
              <div className="inline-block h-6 w-24 rounded bg-gray-700 text-xs leading-6 text-gray-500">
                {quotes[current].company}
              </div>
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
