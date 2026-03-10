const stories = [
  {
    company: 'Acme Corp',
    description: 'See how <strong>Acme Corp</strong>\'s team built a culture of data-driven decisions with beautiful forms.',
    href: '#',
  },
  {
    company: 'TechFlow',
    description: 'Discover how <strong>TechFlow</strong> saved thousands of working hours by building a simple, searchable form system.',
    href: '#',
  },
  {
    company: 'ScaleUp',
    description: 'See how <strong>ScaleUp</strong> drove a six-fold increase in lead conversion by focusing on form UX.',
    href: '#',
  },
];

export default function CustomerStories() {
  return (
    <section className="bg-gray-100 pb-12 pt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Hear from teams building with Dooform
          </h2>
          <a href="/product/customers/" className="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
            All customer stories
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-16">
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {stories.map((story) => (
            <a
              key={story.company}
              href={story.href}
              className="flex min-h-[250px] flex-col rounded-sm bg-white p-0 transition hover:shadow-md"
            >
              {/* Logo placeholder */}
              <div className="flex h-12 items-center px-6 pt-6">
                <div className="h-6 w-24 rounded bg-gray-200 text-xs leading-6 text-gray-400" />
              </div>

              {/* Description */}
              <div
                className="flex-1 px-6 pb-6 pt-4 text-lg font-normal leading-snug text-gray-900"
                dangerouslySetInnerHTML={{ __html: story.description }}
              />

              {/* CTA */}
              <div className="flex items-center gap-2 border-t border-gray-200 px-6 py-3 text-sm text-gray-600">
                Read case study
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="m17.52 9.28.56.54-.56.54-7.25 6.93-1.04-1.08 5.97-5.71H2V9h15.24zM15.7 7.5h-2.15L9.23 3.29l1.04-1.08z" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
