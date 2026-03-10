'use client';

import { useState } from 'react';

const navItems = [
  {
    label: 'Product',
    href: '/product/',
    active: true,
    submenu: [
      { label: 'Features', href: '/product/features/' },
      { label: 'Customers', href: '/product/customers/' },
      { label: 'Security', href: '/product/security/' },
      { label: 'Pricing', href: '/product/pricing/' },
      { label: '---' },
      { label: 'Login', href: '#', external: true },
      { label: 'Try free', href: '#', external: true },
    ],
  },
  { label: 'Enterprise', href: '/enterprise/' },
  { label: 'Integrations', href: '/integrations/' },
  { label: 'Partnerships', href: '/partnerships/' },
  { label: 'Resources', href: '/resources/', hasDropdown: true },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="bg-white/95 backdrop-blur" style={{ opacity: 1 }} />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center px-6">
        {/* Logo */}
        <a href="/" className="relative z-10 mr-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-800" />
          <span className="text-lg font-semibold text-gray-900">Dooform</span>
          <span className="text-sm text-gray-400">Business</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 lg:block" id="main-navigation">
          <ul className="flex flex-1 items-center gap-1">
            {navItems.map((item) => (
              <li key={item.label} className="relative">
                <a
                  href={item.href}
                  className={`inline-flex items-center gap-1 rounded px-3 py-2 text-sm font-medium transition hover:bg-gray-100 ${
                    item.active ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {(item.submenu || item.hasDropdown) && (
                    <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 12 7">
                      <path d="m1 1 5 5 5-5" />
                    </svg>
                  )}
                </a>
              </li>
            ))}
            <li className="flex-1" />
          </ul>
        </nav>

        {/* CTA */}
        <div className="relative z-10 ml-auto flex items-center gap-3">
          <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
            Talk to an expert
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="ml-3 p-2 lg:hidden"
          aria-label="Toggle main menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="5" width="20" height="2" />
            <rect x="2" y="11" width="20" height="2" />
            <rect x="2" y="17" width="20" height="2" />
          </svg>
        </button>
      </div>
    </header>
  );
}
