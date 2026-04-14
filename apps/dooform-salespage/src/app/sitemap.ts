import type { MetadataRoute } from 'next';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { i18n } from '../i18n/config';

const BASE_URL = 'https://dooform.com';

function getRoutes(dir: string, base = ''): string[] {
  const routes: string[] = [base || ''];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (!statSync(fullPath).isDirectory()) continue;
    const route = `${base}/${entry}`;
    routes.push(route);
    routes.push(...getRoutes(fullPath, route).filter((r) => r !== route));
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const localeDir = join(process.cwd(), 'src/app/[locale]');
  const routes = getRoutes(localeDir);

  return routes.flatMap((route) =>
    i18n.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          i18n.locales.map((l) => [l, `${BASE_URL}/${l}${route}`])
        ),
      },
    }))
  );
}
