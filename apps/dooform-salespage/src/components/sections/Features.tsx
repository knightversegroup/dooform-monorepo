const features = [
  {
    title: 'Drag & Drop Builder',
    description: 'Build forms visually with our intuitive drag and drop interface. No coding needed.',
  },
  {
    title: 'Smart Logic',
    description: 'Create dynamic forms with conditional logic, branching, and calculations.',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track submissions, completion rates, and form performance in real-time.',
  },
  {
    title: 'Integrations',
    description: 'Connect with your favorite tools. Zapier, Slack, Google Sheets, and more.',
  },
  {
    title: 'Mobile Optimized',
    description: 'Forms that look great on every device. Responsive design out of the box.',
  },
  {
    title: 'Security & Compliance',
    description: 'Enterprise-grade security with GDPR compliance and data encryption.',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Features</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to build great forms
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful features to help you create, manage, and analyze your forms.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
            >
              {/* Icon Placeholder */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <div className="h-5 w-5 rounded bg-blue-200" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
