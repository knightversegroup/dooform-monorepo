export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gray-200" />
          <span className="text-lg font-semibold text-gray-900">Dooform</span>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-gray-600 transition hover:text-gray-900">
            Features
          </a>
          <a href="#pricing" className="text-sm text-gray-600 transition hover:text-gray-900">
            Pricing
          </a>
          <a href="#testimonials" className="text-sm text-gray-600 transition hover:text-gray-900">
            Testimonials
          </a>
          <a href="#faq" className="text-sm text-gray-600 transition hover:text-gray-900">
            FAQ
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a href="#" className="hidden text-sm font-medium text-gray-700 transition hover:text-gray-900 sm:block">
            Log in
          </a>
          <a
            href="#"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
