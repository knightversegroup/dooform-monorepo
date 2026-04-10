'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Header/Navbar - From Figma
 * Desktop: Sticky top, white bg, border bottom, logo + nav links + CTA
 * Mobile: Sticky header with hamburger menu
 */

// TODO: Replace with actual logo image
const imgLogo = "https://www.figma.com/api/mcp/asset/b2167fcc-0c8f-49d8-8967-00a25918c181";
const imgMobileHeader = "https://www.figma.com/api/mcp/asset/c34e5969-99ec-4228-93e6-41343e697f68";

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Compliance', href: '#compliance' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Mobile Header */}
      <div className="lg:hidden h-[72px] bg-white border-b border-[#e7e7e7]">
        <img
          src={imgMobileHeader}
          alt="Dooform"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-[#e7e7e7]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 py-6">
          {/* Logo */}
          <Link href="/" className="h-6 w-[124px]">
            <img src={imgLogo} alt="Dooform" className="h-full w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[16px] text-black hover:opacity-70 transition-opacity"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/trial"
              className="flex items-center justify-center px-3 py-1.5 bg-white rounded-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] hover:shadow-md transition-shadow"
            >
              <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-black">
                ทดลองใช้งาน
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#e7e7e7]">
          <nav className="max-w-[1280px] mx-auto px-4 py-4">
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block font-['IBM_Plex_Sans_Thai'] font-semibold text-[16px] text-black py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/trial"
                  className="inline-flex items-center justify-center w-full h-[44px] mt-2 bg-[#2c2585] rounded-full text-white font-medium"
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
