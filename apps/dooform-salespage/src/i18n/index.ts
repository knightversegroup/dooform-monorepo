import type { SalespageDict } from '@dooform/shared';
import type { Locale } from './config';

const localDictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  th: () => import('./dictionaries/th.json').then((m) => m.default),
};

/** Deep-merge `source` into `target`. Arrays and primitives from source win;
 *  objects are merged recursively so missing nested keys fall back to target. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
  if (
    source === null ||
    source === undefined ||
    typeof source !== 'object' ||
    Array.isArray(source)
  ) {
    return source !== undefined ? source : target;
  }
  if (typeof target !== 'object' || target === null || Array.isArray(target)) {
    return source;
  }
  const result = { ...target };
  for (const key of Object.keys(source)) {
    result[key] = deepMerge(target[key], source[key]);
  }
  return result;
}

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
    // Deep merge: API values win, local fills in any missing nested keys
    return deepMerge(local, remote) as SalespageDict;
  } catch (err) {
    console.warn(`[salespage i18n] falling back to local ${locale}.json:`, err);
    return local;
  }
};
