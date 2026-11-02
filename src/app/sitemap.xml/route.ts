import { getSitemapFiles } from '@/lib/seo/sitemap-data';
import { buildSitemapIndexXml, xmlResponse } from '@/lib/seo/sitemap';

export const revalidate = 3600;

export async function GET() {
  return xmlResponse(buildSitemapIndexXml(await getSitemapFiles()));
}
