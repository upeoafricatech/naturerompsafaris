import type { SupabaseClient } from '@supabase/supabase-js';

import { isPublicLocale, PUBLIC_LOCALES } from '@/lib/i18n';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

export type SitemapUrlEntry = {
  lastModified?: Date;
  path: string;
};

export type SitemapFileEntry = {
  lastModified?: Date;
  name: string;
};

type TranslationRow = {
  locale: string;
  published_at: string | null;
  slug: string;
  updated_at: string | null;
};

/** Content sections; each name is both the public URL prefix and the sitemap file name. */
export const SITEMAP_SECTIONS = [
  'tours',
  'safari-packages',
  'destinations',
  'national-parks',
  'experiences',
  'accommodations',
  'our-fleet',
  'blog'
] as const;

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

export const PAGES_SITEMAP = 'pages';

const ALWAYS_LISTED_PATHS = [
  '',
  'about',
  'contact',
  'privacy-policy',
  'cookie-policy',
  'terms-conditions',
  'payment-terms',
  'service-level-agreement'
];

export function sitemapFilePath(name: string) {
  return `/sitemaps/${name}.xml`;
}

export function isSitemapSection(name: string): name is SitemapSection {
  return (SITEMAP_SECTIONS as readonly string[]).includes(name);
}

function sitemapClient() {
  return createEnquiryPublicClient() as unknown as SupabaseClient;
}

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function mapRows(data: unknown): TranslationRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const record = row as Record<string, unknown>;
    return {
      locale: record.locale as string,
      published_at: record.published_at as string | null,
      slug: record.slug as string,
      updated_at: record.updated_at as string | null
    };
  });
}

async function safeRows(
  query: PromiseLike<{ data: unknown; error: { message?: string } | null }>
): Promise<TranslationRow[]> {
  try {
    const { data, error } = await query;
    if (error) return [];
    return mapRows(data);
  } catch {
    return [];
  }
}

function translationQuery(table: string, parentSelect: string) {
  return sitemapClient()
    .from(table)
    .select(`locale, slug, published_at, updated_at, ${parentSelect}`)
    .in('locale', PUBLIC_LOCALES)
    .not('published_at', 'is', null);
}

const SECTION_FETCHERS: Record<SitemapSection, () => Promise<TranslationRow[]>> = {
  tours: () =>
    safeRows(
      translationQuery('tour_translations', 'tour:tours!inner(status)').eq(
        'tour.status',
        'published'
      )
    ),
  'safari-packages': () =>
    safeRows(
      translationQuery('package_translations', 'package:packages!inner(status)').eq(
        'package.status',
        'published'
      )
    ),
  destinations: () =>
    safeRows(
      translationQuery(
        'destination_translations',
        'destination:destinations!inner(status, deleted_at)'
      )
        .eq('destination.status', 'published')
        .is('destination.deleted_at', null)
    ),
  'national-parks': () =>
    safeRows(
      translationQuery('national_park_translations', 'park:national_parks!inner(status)').eq(
        'park.status',
        'published'
      )
    ),
  experiences: () =>
    safeRows(
      translationQuery(
        'experience_translations',
        'experience:experiences!inner(status, deleted_at)'
      )
        .eq('experience.status', 'published')
        .is('experience.deleted_at', null)
    ),
  accommodations: () =>
    safeRows(
      translationQuery(
        'accommodation_translations',
        'accommodation:accommodations!inner(status, deleted_at)'
      )
        .eq('accommodation.status', 'published')
        .is('accommodation.deleted_at', null)
    ),
  'our-fleet': () =>
    safeRows(
      translationQuery('fleet_vehicle_translations', 'vehicle:fleet_vehicles!inner(status)').eq(
        'vehicle.status',
        'published'
      )
    ),
  blog: () =>
    safeRows(
      translationQuery('blog_translations', 'post:blog_posts!inner(status, deleted_at)')
        .eq('post.status', 'published')
        .is('post.deleted_at', null)
    )
};

function rowsToEntries(rows: TranslationRow[], section: SitemapSection): SitemapUrlEntry[] {
  const seen = new Set<string>();
  return rows.flatMap((row) => {
    if (!isPublicLocale(row.locale) || !row.slug) return [];
    const path = `/${row.locale}/${section}/${row.slug}`;
    if (seen.has(path)) return [];
    seen.add(path);
    return [{ lastModified: parseDate(row.updated_at) ?? parseDate(row.published_at), path }];
  });
}

function latest(entries: SitemapUrlEntry[]) {
  let result: Date | undefined;
  for (const entry of entries) {
    if (entry.lastModified && (!result || entry.lastModified > result)) {
      result = entry.lastModified;
    }
  }
  return result;
}

export async function getSectionSitemapUrls(section: SitemapSection) {
  return rowsToEntries(await SECTION_FETCHERS[section](), section);
}

async function getAllSectionUrls() {
  const results = await Promise.all(
    SITEMAP_SECTIONS.map(
      async (section) => [section, await getSectionSitemapUrls(section)] as const
    )
  );
  return new Map<SitemapSection, SitemapUrlEntry[]>(results);
}

function staticPageUrls(sections: Map<SitemapSection, SitemapUrlEntry[]>): SitemapUrlEntry[] {
  // A listing page with no published items is a thin page; leave it out until it has content.
  const listingPaths = SITEMAP_SECTIONS.filter((section) => sections.get(section)?.length);
  const paths = [...ALWAYS_LISTED_PATHS, ...listingPaths];

  return PUBLIC_LOCALES.flatMap((locale) =>
    paths.map((path) => {
      const sectionEntries = isSitemapSection(path) ? sections.get(path) : undefined;
      return {
        lastModified: sectionEntries ? latest(sectionEntries) : undefined,
        path: path ? `/${locale}/${path}` : `/${locale}`
      };
    })
  );
}

export async function getPagesSitemapUrls() {
  return staticPageUrls(await getAllSectionUrls());
}

/** Sitemap files for the index: pages first, then only sections with published URLs. */
export async function getSitemapFiles(): Promise<SitemapFileEntry[]> {
  const sections = await getAllSectionUrls();
  const files: SitemapFileEntry[] = [
    { lastModified: latest([...sections.values()].flat()), name: PAGES_SITEMAP }
  ];

  for (const section of SITEMAP_SECTIONS) {
    const entries = sections.get(section) ?? [];
    if (entries.length) files.push({ lastModified: latest(entries), name: section });
  }

  return files;
}
