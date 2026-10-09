// HTTP 200 verified in production on 2026-10-09. Add a route only after
// authorized publication and a successful production check.
export const publishedPaths = [
  '/',
  '/work/emprega-co',
  '/work/doces-da-pati',
  '/work/helppet',
  '/work/torneio-pebolim',
] as const;

export function renderSitemap(origin: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publishedPaths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
}
