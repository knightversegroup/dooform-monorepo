import type { SalespageDict } from '@dooform/shared';
import type { Locale } from './config';

const localDictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  th: () => import('./dictionaries/th.json').then((m) => m.default),
};

export const getDictionary = async (locale: Locale): Promise<SalespageDict> => {
  const local = (await localDictionaries[locale]()) as unknown as SalespageDict;
  const apiUrl = process.env.CONTENT_API_URL;

  if (!apiUrl) {
    return local;
  }

  try {
    const res = await fetch(`${apiUrl}/salespage-content/${locale}`, {
      next: { tags: [`salespage:${locale}`], revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`content api returned ${res.status}`);
    }
    const remote = (await res.json()) as Partial<SalespageDict>;
    // Merge: API values win, local fills in any missing sections
    return { ...local, ...remote };
  } catch (err) {
    console.warn(`[salespage i18n] falling back to local ${locale}.json:`, err);
    return local;
  }
};
