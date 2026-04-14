import { i18n } from '../../i18n/config';

const BASE_URL = 'https://dooform.com';

const routes = ['', '/features', '/compliance', '/plan', '/usecases'];

export async function GET() {
  const urls = routes.flatMap((route) =>
    i18n.locales.map(
      (locale) => `  <url>
    <loc>${BASE_URL}/${locale}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
