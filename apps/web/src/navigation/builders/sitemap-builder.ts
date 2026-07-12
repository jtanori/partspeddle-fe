import { BuiltRoute, SitemapEntry } from '../types';

export function buildSitemap(
  registry: Record<string, BuiltRoute>,
  baseUrl: string = 'https://partspeddle.com',
): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  for (const route of Object.values(registry)) {
    if (!route.sitemap) continue;
    if (route.path.includes(':')) continue;

    entries.push({
      loc: `${baseUrl}${route.path}`,
      priority: route.id === 'home' ? 1.0 : 0.7,
      changefreq: route.id === 'home' ? 'daily' : 'weekly',
    });
  }

  return entries;
}

export function generateSitemapXml(
  registry: Record<string, BuiltRoute>,
  baseUrl: string = 'https://partspeddle.com',
): string {
  const entries = buildSitemap(registry, baseUrl);

  const urlset = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}
