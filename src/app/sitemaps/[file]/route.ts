import {
  getPagesSitemapUrls,
  getSectionSitemapUrls,
  isSitemapSection,
  PAGES_SITEMAP,
  SITEMAP_SECTIONS
} from '@/lib/seo/sitemap-data';
import { buildUrlSetXml, xmlResponse } from '@/lib/seo/sitemap';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return [PAGES_SITEMAP, ...SITEMAP_SECTIONS].map((name) => ({ file: `${name}.xml` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = file.replace(/\.xml$/, '');

  if (name === PAGES_SITEMAP) {
    return xmlResponse(buildUrlSetXml(await getPagesSitemapUrls()));
  }
  if (!isSitemapSection(name)) {
    return new Response('Not found', { status: 404 });
  }
  return xmlResponse(buildUrlSetXml(await getSectionSitemapUrls(name)));
}
