import type { SalespageDict } from '@dooform/shared';
import type { Locale } from './config';

const localDictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  th: () => import('./dictionaries/th.json').then((m) => m.default),
};

export const getDictionary = async (locale: Locale): Promise<SalespageDict> => {
  const apiUrl = process.env.CONTENT_API_URL;

  if (!apiUrl) {
    return (await localDictionaries[locale]()) as unknown as SalespageDict;
  }

  try {
    const res = await fetch(`${apiUrl}/salespage-content/${locale}`, {
      next: { tags: [`salespage:${locale}`], revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`content api returned ${res.status}`);
    }
    return (await res.json()) as SalespageDict;
  } catch (err) {
    console.warn(`[salespage i18n] falling back to local ${locale}.json:`, err);
    return (await localDictionaries[locale]()) as unknown as SalespageDict;
  }
};
