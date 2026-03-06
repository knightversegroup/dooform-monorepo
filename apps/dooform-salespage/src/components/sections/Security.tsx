export default function Security() {
  return (
    <section className="overflow-hidden bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex gap-6 sm:flex-col">
          {/* Left Column */}
          <div className="flex-1 pr-6">
            <h2 className="mb-3 max-w-sm text-3xl font-bold leading-snug tracking-tight">
              We protect your data and respect your forms
            </h2>
            <p className="mb-8 text-base text-gray-300">
              We call it &ldquo;enterprise-grade security&rdquo;. You can call it peace of mind.
              Either way, we take it seriously. Because it&apos;s what keeps your data safe.
            </p>
            {/* Security badges placeholder */}
            <div className="flex gap-3">
              {['ISO', 'SOC2', 'SSO', 'GDPR'].map((badge) => (
                <div
                  key={badge}
                  className="flex h-12 w-12 items-center justify-center rounded bg-gray-700 text-xs font-medium text-gray-400"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1">
            <h2 className="mb-3 max-w-sm text-3xl font-bold leading-snug tracking-tight">
              Building socially responsible AI
            </h2>
            <p className="mb-8 text-base text-gray-300">
              We&apos;re building a new era of socially responsible AI. One that&apos;s human-driven,
              where attribution is non-negotiable, and where feedback directly informs products.
            </p>
            <div className="flex gap-3 sm:flex-col">
              <a href="/product/security/" className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium transition hover:bg-gray-500">
                Security specs
              </a>
              <a href="#" className="rounded-md px-4 py-2 text-sm font-medium transition hover:bg-gray-700">
                Read about our AI philosophy
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
