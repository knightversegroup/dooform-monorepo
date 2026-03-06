export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gray-200" />
              <span className="text-lg font-semibold text-gray-900">Dooform</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Build beautiful forms with ease.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Features</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Pricing</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Changelog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">About</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; 2026 Dooform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
