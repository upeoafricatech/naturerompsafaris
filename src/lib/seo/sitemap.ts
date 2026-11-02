import { crawlAbsoluteUrl } from './absolute-url';
import { sitemapFilePath, type SitemapFileEntry, type SitemapUrlEntry } from './sitemap-data';

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
};

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

function lastmodTag(date?: Date) {
  return date ? `<lastmod>${date.toISOString()}</lastmod>` : '';
}

export function buildSitemapIndexXml(files: SitemapFileEntry[]) {
  const items = files
    .map(
      (file) =>
        `<sitemap><loc>${escapeXml(crawlAbsoluteUrl(sitemapFilePath(file.name)))}</loc>${lastmodTag(file.lastModified)}</sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}

export function buildUrlSetXml(entries: SitemapUrlEntry[]) {
  const items = entries
    .map(
      (entry) =>
        `<url><loc>${escapeXml(crawlAbsoluteUrl(entry.path))}</loc>${lastmodTag(entry.lastModified)}</url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;
}

export function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
