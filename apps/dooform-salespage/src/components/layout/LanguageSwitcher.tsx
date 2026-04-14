'use client';

import { usePathname } from 'next/navigation';

const localeLabels: Record<string, string> = {
  en: 'EN',
  th: 'TH',
};

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();

  const switchedLocale = locale === 'en' ? 'th' : 'en';
  const newPath = pathname.replace(`/${locale}`, `/${switchedLocale}`);

  return (
    <a
      href={newPath}
      className="rounded-md border border-gray-300 px-2.5 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
    >
      {localeLabels[switchedLocale]}
    </a>
  );
}
