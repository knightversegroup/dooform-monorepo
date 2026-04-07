'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Navigation items based on Figma design
 * Widths from Figma: Features(68px), Solutions(73px), Compliance(92px), Pricing(54px)
 */
const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Compliance', href: '#compliance' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 left-0 right-0 z-50 h-nav-height bg-white border-b border-grey-border"
      role="banner"
    >
      {/* Inner Content Wrapper - 1280px max, centered */}
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-4 py-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          aria-label="Dooform Home"
        >
          <img
            src="/logo.svg"
            alt="Dooform"
            width={124}
            height={24}
            className="h-6 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-6"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="font-kanit text-nav-link text-black hover:opacity-70 transition-opacity"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/trial"
            className="
              hidden sm:flex items-center justify-center gap-2.5
              h-[35px] px-3 py-1.5
              bg-white rounded-pill shadow-btn-subtle
              text-nav-cta text-black
              hover:shadow-md transition-shadow
            "
          >
            <span>ทดลองใช้งาน</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="2" y="5" width="20" height="2" rx="1" />
                <rect x="2" y="11" width="20" height="2" rx="1" />
                <rect x="2" y="17" width="20" height="2" rx="1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-white border-t border-grey-border"
          role="menu"
        >
          <nav className="mx-auto max-w-container px-4 py-4">
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.label} role="none">
                  <Link
                    href={item.href}
                    className="block font-kanit text-nav-link text-black py-2"
                    role="menuitem"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li role="none">
                <Link
                  href="/trial"
                  className="
                    inline-flex items-center justify-center
                    w-full h-[44px] mt-2
                    bg-primary-navy rounded-pill
                    text-white font-medium
                  "
                  role="menuitem"
                  onClick={() => setMobileOpen(false)}
                >
                  ทดลองใช้งาน
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
