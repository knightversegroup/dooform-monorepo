export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
            New: AI-powered form builder
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Build forms that
            <span className="text-blue-600"> convert</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Create beautiful, responsive forms in minutes. No coding required.
            Collect data, gather feedback, and grow your business.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="#"
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              Start for free
            </a>
            <a
              href="#"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View demo
            </a>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-2xl">
            <div className="flex h-[400px] items-center justify-center text-gray-400">
              <span className="text-sm">Hero Image / Product Screenshot</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
