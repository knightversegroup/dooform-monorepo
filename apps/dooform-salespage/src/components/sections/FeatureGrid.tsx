const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" className="h-8 w-8" fill="currentColor">
        <path d="M17 7.86v8.64h-1.5V8.56L10 3.96l-5.5 4.6v7.94h3v-5h5v5h3V18H11v-5H9v5H4.5A1.5 1.5 0 0 1 3 16.5V7.86L10 2z" />
      </svg>
    ),
    title: 'All your forms, in one place',
    description: 'Scattered forms are hard to find and bad data is hard to trust. Dooform collects, validates, and stores your forms in one place -- and our API makes it easy for teams and tools to find, use and create new forms.',
    imageAlt: 'Forms dashboard',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor">
        <path d="M16 1a15 15 0 1 1 0 30 15 15 0 0 1 0-30m0 2.5a12.5 12.5 0 1 0 0 25 12.5 12.5 0 0 0 0-25m8.41 7.73-.88.89L14 21.65l-.89.88-.88-.88L7.59 17l1.77-1.77L13.1 19l9.53-9.53z" />
      </svg>
    ),
    title: 'Trusted tools to keep building',
    description: 'Dooform makes creating forms easy. Familiar UX, templates, and smart suggestions fuel a continuous cycle where your team validates, improves, and makes every form better.',
    imageAlt: 'Form builder',
    reverse: true,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" className="h-8 w-8" fill="currentColor">
        <path d="M14.03 10.6c.96 0 1.8.59 2.12 1.49l1.07 3c.52 1.46-.56 3-2.12 3H15v-1.5h.1c.52 0 .88-.51.7-1l-1.06-3a.75.75 0 0 0-.7-.5H13v-1.5zm-4.08-.06a1.5 1.5 0 0 1 1.27.9l1.91 4.47a1.5 1.5 0 0 1-1.18 2.08l-.2.01H3.5l-.2-.01A1.5 1.5 0 0 1 2 16.5h9.75l-1.91-4.47H5.42L4.14 15H2.51l1.53-3.56a1.5 1.5 0 0 1 1.26-.9h4.64M12 1.99a3.75 3.75 0 0 1 0 7.5V8a2.25 2.25 0 0 0 0-4.5h-.4V2zM7.83 2a3.74 3.74 0 0 1 3.54 3.73v.2a3.74 3.74 0 0 1-3.73 3.54h-.2a3.74 3.74 0 0 1-3.53-3.55v-.19A3.74 3.74 0 0 1 7.63 2zm-.2 1.5a2.24 2.24 0 0 0 0 4.47 2.24 2.24 0 0 0 0-4.47" />
      </svg>
    ),
    title: 'Data to power your team',
    description: 'Dooform structures data so teams can use it instantly. Votes validate quality, tags organize content, and analytics establish trust. Clean data for everyone.',
    imageAlt: 'Analytics dashboard',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" className="h-8 w-8" fill="currentColor">
        <path d="M11.5 3c.83 0 1.5.67 1.5 1.5V6h3.5c.83 0 1.5.67 1.5 1.5v8h-1.5V17h-13A1.5 1.5 0 0 1 2 15.65V7.5C2 6.67 2.67 6 3.5 6H7V4.5C7 3.67 7.67 3 8.5 3zM13 15.5h3.5v-8H13zm-4.5 0h3v-8h-3zm-5 0H7v-8H3.5zm5-9.5h3V4.5h-3z" />
      </svg>
    ),
    title: 'Works where you work',
    description: 'Dooform delivers trusted forms right into the tools your team uses. Data also feeds back from those tools, creating a constant loop of up-to-date, verified information.',
    imageAlt: 'Integrations',
    reverse: true,
    badges: [
      { label: 'COMING SOON', color: 'bg-yellow-300 text-yellow-900', text: 'Curate forms from Confluence, Microsoft Teams and more.' },
      { label: 'NEW', color: 'bg-orange-500 text-black', text: 'API now available -- connect forms with tools like Zapier and Make.' },
    ],
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm text-gray-500">A Form Intelligence Layer</p>
        <h2 className="mb-12 max-w-lg text-3xl font-bold leading-snug tracking-tight text-gray-900">
          Trusted forms, powered by people and AI, in every workflow
        </h2>

        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`flex bg-gray-100 sm:flex-col ${feature.reverse ? 'flex-row-reverse' : ''}`}
            >
              {/* Text */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 text-gray-700">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600">{feature.description}</p>

                {feature.badges && (
                  <div className="mt-auto flex gap-3 pt-6 sm:flex-col">
                    {feature.badges.map((badge) => (
                      <div key={badge.label} className="flex-1">
                        <span className={`mb-1.5 inline-block px-1.5 py-0.5 text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                        <div className="text-sm text-gray-600">{badge.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="flex flex-1 items-center justify-center">
                <div className="flex aspect-[555/346] w-full items-center justify-center bg-gray-200 text-sm text-gray-400">
                  {feature.imageAlt}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dive deeper CTA */}
        <div className="pb-8 pt-12 text-center">
          <div className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
            Dive deeper into the features
          </div>
          <a href="/product/features/" className="inline-block rounded-md bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">
            Show me more
          </a>
        </div>
      </div>
    </section>
  );
}
