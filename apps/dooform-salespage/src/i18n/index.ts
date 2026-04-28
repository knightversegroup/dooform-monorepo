import type { SalespageDict } from '@dooform/shared';
import type { Locale } from './config';

const localDictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  th: () => import('./dictionaries/th.json').then((m) => m.default),
};

/** Deep-merge `source` into `target`. Arrays and primitives from source win;
 *  objects are merged recursively so missing nested keys fall back to target. */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv !== null &&
      sv !== undefined &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      tv !== undefined &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      result[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      ) as T[keyof T];
    } else if (sv !== undefined) {
      result[key] = sv as T[keyof T];
    }
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
    return deepMerge(local, remote);
  } catch (err) {
    console.warn(`[salespage i18n] falling back to local ${locale}.json:`, err);
    return local;
  }
};
