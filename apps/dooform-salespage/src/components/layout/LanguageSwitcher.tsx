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
      className="rounded-full bg-white px-3 py-1.5 text-base font-semibold text-black shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]"
    >
      {localeLabels[switchedLocale]}
    </a>
  );
}
