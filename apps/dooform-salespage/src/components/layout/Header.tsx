'use client';

import { useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';
import LanguageSwitcher from './LanguageSwitcher';

type NavDict = {
  features: string;
  useCases: string;
  compliance: string;
  plan: string;
  articles: string;
  register: string;
};

export default function Header({
  dict,
  locale,
}: {
  dict: NavDict;
  locale: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: dict.features, href: `/${locale}/features` },
    { label: dict.useCases, href: `/${locale}/usecases` },
    { label: dict.compliance, href: `/${locale}/compliance` },
    { label: dict.plan, href: `/${locale}/plan` },
    { label: dict.articles, href: `/${locale}/articles` },
  ];

  return (
    <div className="sticky top-0 border-b border-[#e7e7e7] z-50 bg-white">
      <header className="">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 sticky top-0 bg-white">
          {/* Logo */}
          <a href={`/${locale}`}>
            <DooformLogo />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 font-semibold text-base text-black md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex justify-center">
            <LanguageSwitcher locale={locale} />
            <a
              href="#trial"
              className="rounded-full bg-white px-3 py-1.5 text-base font-semibold text-black shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]"
            >
              {dict.register}
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>
      <div
        className={`fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between px-4 py-6">
          <a href={`/${locale}`} onClick={() => setMobileOpen(false)}>
            <DooformLogo />
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex flex-col px-6 pt-6">
          <nav className="flex flex-col gap-6 font-inter font-semibold text-2xl text-black">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="#trial" onClick={() => setMobileOpen(false)}>
              {dict.register}
            </a>
          </nav>
          <div className="mt-8">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
