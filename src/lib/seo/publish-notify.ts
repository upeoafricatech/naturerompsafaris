import { revalidatePath } from 'next/cache';

import { isPublicLocale, SUPPORTED_LOCALES } from '@/lib/i18n';

import { notifySearchEnginesLater } from './indexing';
import { sitemapFilePath } from './sitemap-data';

const LISTING_SEGMENTS_BY_PREFIX: Record<string, string[]> = {
  accommodations: ['', 'accommodations'],
  blog: ['', 'blog'],
  destinations: ['', 'destinations'],
  experiences: ['', 'experiences', 'tours'],
  'national-parks': ['', 'national-parks', 'tours'],
  'our-fleet': ['', 'our-fleet'],
  'safari-packages': ['', 'safari-packages', 'tours'],
  tours: ['', 'tours', 'safari-packages']
};

type PublishedContentInput = {
  listingPaths?: string[];
  locales?: string[];
  pathPrefix: string;
  slug: string;
};

function defaultListingPaths(pathPrefix: string, locales: string[]) {
  const segments = LISTING_SEGMENTS_BY_PREFIX[pathPrefix] ?? ['', pathPrefix];
  return locales.flatMap((locale) =>
    segments.map((segment) => (segment ? `/${locale}/${segment}` : `/${locale}`))
  );
}

function isPublicLocalePath(path: string) {
  return isPublicLocale(path.split('/').filter(Boolean)[0]);
}

/**
 * Revalidate + instant-index a published CMS entity across locales.
 * Only public-locale URLs are submitted to search engines; other locales 404.
 */
export function notifyPublishedContent({
  listingPaths,
  locales = SUPPORTED_LOCALES,
  pathPrefix,
  slug
}: PublishedContentInput) {
  const detailPaths = locales.map((locale) => `/${locale}/${pathPrefix}/${slug}`);
  const paths = [...(listingPaths ?? defaultListingPaths(pathPrefix, locales)), ...detailPaths];

  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath('/sitemap.xml');
  revalidatePath(sitemapFilePath('pages'));
  revalidatePath(sitemapFilePath(pathPrefix));

  notifySearchEnginesLater(paths.filter(isPublicLocalePath));
}
