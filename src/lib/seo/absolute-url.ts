export const DEFAULT_PUBLIC_SITE_URL = 'https://www.kenyatanzaniasafariadventures.com';

const PRODUCTION_APEX_HOST = 'kenyatanzaniasafariadventures.com';
const PRODUCTION_WWW_HOST = 'www.kenyatanzaniasafariadventures.com';

function withPublicCanonicalHost(raw: string) {
  try {
    const url = new URL(raw);
    if (url.hostname === PRODUCTION_APEX_HOST) {
      url.hostname = PRODUCTION_WWW_HOST;
    }
    return url.toString();
  } catch {
    return raw;
  }
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return withPublicCanonicalHost(path);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_PUBLIC_SITE_URL;
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return withPublicCanonicalHost(`${normalizedSiteUrl}${normalizedPath}`);
}

/** Same as absoluteUrl; named for sitemap/robots crawl URLs. */
export function crawlAbsoluteUrl(path = '/') {
  return absoluteUrl(path);
}
