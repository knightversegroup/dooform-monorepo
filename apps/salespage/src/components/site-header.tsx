'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  LogIn,
  Menu,
  Phone,
  X,
} from 'lucide-react';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';
import { Typography } from '@dooform/ui';

/* External destinations — single source of truth so the top bar, the
 * desktop CTAs and the mobile panel all stay in sync. */
const LOGIN_URL = 'https://console.dooform.com/auth/login';
const REGISTER_URL = 'https://console.dooform.com/auth/register';
const CONTACT_HASH = '/#contact';

type NavChild = {
  label: string;
  description?: string;
  href: string;
};

type NavItem = {
  key: string;
  label: string;
  /* When set, the item is a flat link. When omitted, `children` renders a
   * dropdown (desktop) / accordion (mobile). */
  href?: string;
  children?: NavChild[];
};

const NAV: NavItem[] = [
  {
    key: 'products',
    label: 'ผลิตภัณฑ์',
    children: [
      {
        label: 'แพลตฟอร์มสำหรับธุรกิจ',
        description: 'บริหารงานแปลเอกสารทั้งองค์กรในที่เดียว',
        href: '/#business-features',
      },
      {
        label: 'แอปพลิเคชันสำหรับนักแปล',
        description: 'เครื่องมือแปลเอกสารครบวงจรสำหรับนักแปล',
        href: '/#translator-features',
      },
      {
        label: 'รายการเอกสาร',
        description: 'เทมเพลตเอกสารราชการกว่า 100 ฟอร์ม',
        href: '/templates',
      },
    ],
  },
  {
    key: 'features',
    label: 'ฟังก์ชั่น',
    children: [
      { label: 'ฟังก์ชั่นสำหรับธุรกิจ', description: 'จัดการทีม สิทธิ์การเข้าถึง และตราปั๊มองค์กร', href: '/#business-features' },
      { label: 'ฟังก์ชั่นสำหรับนักแปล', description: 'AI แปลภาษา OCR และคลังคำศัพท์ราชการ', href: '/#translator-features' },
      { label: 'ตัวอย่างการใช้งาน', description: 'แปลเอกสารครบจบใน 4 ขั้นตอน', href: '/#how-it-works' },
    ],
  },
  { key: 'pricing', label: 'ราคาและแพ็กเกจ', href: '/pricing' },
  { key: 'templates', label: 'รายการเอกสาร', href: '/templates' },
  { key: 'articles', label: 'บทความ', href: '/#articles' },
];

export function SiteHeader() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-df-grey/95 backdrop-blur">
      {/* ── Top utility bar ─────────────────────────────────────────── */}
      <div className="hidden border-b border-neutral-200/60 bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-6 px-6 py-2 lg:px-8">
          <a
            href={CONTACT_HASH}
            className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <Phone className="h-3.5 w-3.5" />
            <Typography as="span" variant="caption" tone="inherit">
              ปรึกษาทีมขาย: 02-XXX-XXXX
            </Typography>
          </a>
          <a
            href={LOGIN_URL}
            className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <LogIn className="h-3.5 w-3.5" />
            <Typography as="span" variant="caption" tone="inherit">
              เข้าสู่ระบบ
            </Typography>
          </a>
          <LanguageSwitcher />
        </div>
      </div>

      {/* ── Main navigation ─────────────────────────────────────────── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link href="/" aria-label="Dooform" className="flex items-center">
          <DooformLogo width={120} height={22} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavMenuItem
              key={item.key}
              item={item}
              open={openKey === item.key}
              onOpenChange={(next) => setOpenKey(next ? item.key : null)}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={REGISTER_URL}
            className="inline-flex items-center rounded-full border border-black bg-df-orange px-4 py-2 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#f57f15]"
          >
            <Typography as="span" variant="body-sm" weight="semibold" tone="inverse">
              ทดลองใช้งานฟรี
            </Typography>
          </a>
          <a
            href={CONTACT_HASH}
            className="inline-flex items-center rounded-full border border-black bg-white px-4 py-2 text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            <Typography as="span" variant="body-sm" weight="semibold" tone="inherit">
              นัดสาธิตการใช้งาน
            </Typography>
          </a>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile panel ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <nav className="flex flex-col px-4 py-4">
            {NAV.map((item) => {
              if (item.href) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMobile}
                    className="border-b border-neutral-100 py-3 text-neutral-800 transition-colors hover:text-df-navy"
                  >
                    <Typography as="span" variant="body" weight="medium" tone="inherit">
                      {item.label}
                    </Typography>
                  </Link>
                );
              }
              const isExpanded = mobileExpanded === item.key;
              return (
                <div key={item.key} className="border-b border-neutral-100">
                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpanded(isExpanded ? null : item.key)
                    }
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between py-3 text-left text-neutral-800 transition-colors hover:text-df-navy"
                  >
                    <Typography as="span" variant="body" weight="medium" tone="inherit">
                      {item.label}
                    </Typography>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="flex flex-col gap-3 pb-3 pl-3">
                      {item.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={closeMobile}
                          className="flex flex-col text-neutral-700 transition-colors hover:text-df-navy"
                        >
                          <Typography as="span" variant="body-sm" weight="medium" tone="inherit">
                            {child.label}
                          </Typography>
                          {child.description && (
                            <Typography as="span" variant="caption" tone="inherit" className="text-neutral-500">
                              {child.description}
                            </Typography>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile CTAs + login */}
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={REGISTER_URL}
                className="inline-flex items-center justify-center rounded-full border border-black bg-df-orange px-4 py-2.5 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#f57f15]"
              >
                <Typography as="span" variant="body-sm" weight="semibold" tone="inverse">
                  ทดลองใช้งานฟรี
                </Typography>
              </a>
              <a
                href={CONTACT_HASH}
                onClick={closeMobile}
                className="inline-flex items-center justify-center rounded-full border border-black bg-white px-4 py-2.5 text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                <Typography as="span" variant="body-sm" weight="semibold" tone="inherit">
                  นัดสาธิตการใช้งาน
                </Typography>
              </a>
              <a
                href={LOGIN_URL}
                className="mt-1 inline-flex items-center justify-center gap-2 text-neutral-600 transition-colors hover:text-neutral-900"
              >
                <LogIn className="h-4 w-4" />
                <Typography as="span" variant="body-sm" tone="inherit">
                  เข้าสู่ระบบ
                </Typography>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ── Desktop nav item ──────────────────────────────────────────────── */

function NavMenuItem({
  item,
  open,
  onOpenChange,
}: {
  item: NavItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (item.href && !item.children) {
    return (
      <Link
        href={item.href}
        className="rounded-md px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
      >
        <Typography as="span" variant="body-sm" weight="medium" tone="inherit">
          {item.label}
        </Typography>
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
      >
        <Typography as="span" variant="body-sm" weight="medium" tone="inherit">
          {item.label}
        </Typography>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Flyout: appears on hover with a small upward translate. */}
      <div
        className={`absolute left-0 top-full pt-2 transition-all duration-150 ${
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        <div className="w-[340px] rounded-xl border border-neutral-200 bg-white p-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {item.children?.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-50"
            >
              <div className="min-w-0 flex-1">
                <Typography
                  as="span"
                  variant="body-sm"
                  weight="semibold"
                  tone="inherit"
                  className="block text-neutral-900 transition-colors group-hover:text-df-navy"
                >
                  {child.label}
                </Typography>
                {child.description && (
                  <Typography
                    as="span"
                    variant="caption"
                    tone="inherit"
                    className="mt-0.5 block text-neutral-500"
                  >
                    {child.description}
                  </Typography>
                )}
              </div>
              <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-300 transition-colors group-hover:text-df-navy" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Language switcher (placeholder — no i18n routing yet) ────────── */

function LanguageSwitcher() {
  const [lang, setLang] = useState<'th' | 'en'>('th');
  return (
    <button
      type="button"
      onClick={() => setLang((l) => (l === 'th' ? 'en' : 'th'))}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-100"
      aria-label="Change language"
    >
      <Typography as="span" variant="micro" weight="semibold" tone="inherit" className="uppercase">
        {lang}
      </Typography>
    </button>
  );
}
