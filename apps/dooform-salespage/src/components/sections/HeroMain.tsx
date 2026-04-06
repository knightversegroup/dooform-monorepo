export default function HeroMain() {
  return (
    <section className="bg-[#0a1628] pt-16 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-12 px-6 md:flex-col md:items-start">
        {/* Left: Text */}
        <div className="flex-1 py-12">
          {/* Announcement Badge */}
          <div className="mb-6 flex items-center gap-3">
            <span className="bg-blue-600 px-2 py-1 text-sm font-medium text-white">
              API
            </span>
            <span className="text-sm leading-snug">
              <strong className="font-bold">สวัสดี available:</strong> Connect
              your forms
              <br className="hidden sm:inline" />
              to any workflow with our new API.
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-xl font-sans text-5xl font-bold leading-[1.1] tracking-tight lg:text-6xl">
            Second guess less,
            <br />
            create more with
            <br />
            Dooform
          </h1>

          {/* Subheading */}
          <p className="mb-0 max-w-md text-lg font-light leading-relaxed text-gray-300">
            Always hunting for the right form? Dooform builds, validates, and
            delivers beautiful forms at the right time, in the right place, for
            your team.
          </p>
        </div>

        {/* Right: Hero Image Placeholder */}
        <div className="-mb-12 flex-1">
          <div className="ml-auto block h-auto w-full max-w-[734px]">
            <div className="flex aspect-[734/765] items-center justify-center rounded-t-2xl bg-[#111d33] text-sm text-gray-500">
              Hero Illustration
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
