import { unstable_cache } from 'next/cache';

import {
  BRAND_CONTACT_DEFAULTS,
  BRAND_FAVICON_PATH,
  BRAND_FOOTER_DESCRIPTION,
  BRAND_SITE_NAME,
  BRAND_WHATSAPP
} from '@/config/brand';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { listPublishedAccommodations } from '@/features/accommodations/public/service';
import type { PublicAccommodation } from '@/features/accommodations/public/types';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';
import type { SupabaseClient } from '@supabase/supabase-js';

import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';
import {
  formatExperienceKeyLabel,
  mapExperienceKeyToTourTier,
  mapExperienceLevelsToTourTiers,
  parseExperiencePackagePricing,
  parsePricingTableKeys,
  type ExperiencePricingTableKey
} from '@/lib/pricing/experience-to-tour-pricing';
import { LEGACY_PAX_BANDS, mapPublicSeasonCells } from '@/features/portal/cms/tours/legacy-pricing';
import {
  formatTourSafariMarketLabel,
  parseTourSafariMarkets
} from '@/features/experiences/public/tour-markets';
import { PUBLIC_TOUR_COLLECTIONS, tourMatchesCollection } from '@/lib/public/tour-collections';
import {
  normalizeGaMeasurementId,
  normalizeGoogleAdsId,
  normalizeGtmId,
  normalizeMetaPixelId
} from '@/lib/public/analytics-ids';
import { normalizeSiteVerificationToken } from '@/lib/site-verification';
import { localePath } from './locale-path';
import { activeHeroSlides, normalizeHeroSlides } from './hero-slides';
import { normalizePageHero, type PageHeroKey } from './page-heroes';
import { TOUR_CATALOG_DURATION_BOUNDS, TOUR_CATALOG_PRICE_BOUNDS } from './tour-format';
import { tourMatchesFilters } from './tour-catalog-match';
import type { HomeReviewItem } from './home-reviews';
import type {
  HeroSlide,
  PageHero,
  PublicBlogPost,
  PublicDestination,
  PublicDestinationDetail,
  PublicDestinationMedia,
  PublicPackage,
  PublicPackageDetail,
  PublicSiteSettings,
  PublicTour,
  PublicTourCatalogFacets,
  PublicTourCatalogFilters,
  PublicTourDetail,
  PublicTourItineraryDay,
  PublicTourPricingCell,
  PublicTourPricingSeason,
  PublicTourPricingTier,
  PublicTourRouteLeg
} from './types';

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function createGenericClient(): SupabaseClient {
  return createEnquiryPublicClient() as unknown as SupabaseClient;
}

/** Use English content when the active locale has no published translations yet. */
async function resolvePublishedContentLocale<T>(
  locale: string,
  fetchRows: (resolvedLocale: string) => Promise<T[]>
): Promise<{ contentLocale: string; rows: T[] }> {
  const rows = await fetchRows(locale);
  if (rows.length || locale === DEFAULT_LOCALE) {
    return { contentLocale: locale, rows };
  }

  return {
    contentLocale: DEFAULT_LOCALE,
    rows: await fetchRows(DEFAULT_LOCALE)
  };
}

function parseRichTextHtml(value: unknown): string | null {
  const record = (value && typeof value === 'object' ? value : null) as {
    html?: unknown;
    text?: unknown;
  } | null;
  if (typeof record?.html === 'string' && record.html.trim()) return record.html;
  if (typeof record?.text === 'string' && record.text.trim()) return record.text;
  return null;
}

function parseItineraryDays(value: unknown): PublicTourItineraryDay[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const accommodationRaw = record.accommodationOptions ?? record.accommodation_options;
    return [
      {
        day: typeof record.day === 'number' ? record.day : index + 1,
        title: typeof record.title === 'string' ? record.title : `Day ${index + 1}`,
        description: typeof record.description === 'string' ? record.description : '',
        imageId: typeof record.imageId === 'string' ? record.imageId : '',
        imageUrl: null,
        imageAlt: null,
        accommodationOptions: parseStringArray(accommodationRaw),
        mealPlan:
          typeof record.mealPlan === 'string'
            ? record.mealPlan
            : typeof record.meal_plan === 'string'
              ? record.meal_plan
              : ''
      }
    ];
  });
}

function parseRouteLegs(value: unknown): PublicTourRouteLeg[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const from = typeof record.from === 'string' ? record.from.trim() : '';
    const to = typeof record.to === 'string' ? record.to.trim() : '';
    return from && to ? [{ from, to }] : [];
  });
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatTierLabel(tier: PublicTourPricingTier['tier']) {
  if (tier === 'budget') return 'Budget options';
  if (tier === 'mid_range') return 'Mid-range options';
  return 'Luxury options';
}

export function formatComfortTierLabel(tier: PublicTourPricingTier['tier'] | null | undefined) {
  if (!tier) return 'Custom Package';
  if (tier === 'budget') return 'Budget Package';
  if (tier === 'mid_range') return 'Mid-Range Package';
  return 'Luxury Package';
}

/** Batch-resolves media_assets rows for a set of ids (used for gallery covers). */
async function resolveMediaByIds(ids: string[]): Promise<Map<string, PublicDestinationMedia>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const supabase = createEnquiryPublicClient();
  const { data } = await supabase.from('media_assets').select('id, url, alt').in('id', uniqueIds);

  return new Map(
    (data ?? []).map((asset) => [asset.id, { alt: asset.alt, id: asset.id, url: asset.url }])
  );
}

const DEFAULT_DESCRIPTION = BRAND_FOOTER_DESCRIPTION;

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mediaUrl(asset: { url?: string | null } | { url?: string | null }[] | null | undefined) {
  return unwrapRelation(asset)?.url ?? null;
}

function mediaAlt(
  asset:
    | { alt?: string | null; url?: string | null }
    | { alt?: string | null; url?: string | null }[]
    | null
    | undefined,
  fallback: string
) {
  return unwrapRelation(asset)?.alt ?? fallback;
}

function readAnalytics(value: unknown): PublicSiteSettings['analytics'] {
  const record = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const str = (key: string) =>
    typeof record[key] === 'string' && (record[key] as string).trim().length > 0
      ? (record[key] as string).trim()
      : null;
  return {
    gaMeasurementId: normalizeGaMeasurementId(str('gaMeasurementId')),
    googleAdsId: normalizeGoogleAdsId(str('googleAdsId')),
    gtmId: normalizeGtmId(str('gtmId')),
    metaPixelId: normalizeMetaPixelId(str('metaPixelId')),
    googleSiteVerification: normalizeSiteVerificationToken(str('googleSiteVerification')),
    bingSiteVerification: normalizeSiteVerificationToken(str('bingSiteVerification'))
  };
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  return unstable_cache(
    fetchPublicSiteSettings,
    ['public-site-settings', 'footer-v3', 'analytics-v1'],
    {
      revalidate: 300,
      tags: ['site-settings']
    }
  )();
}

async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  const supabase = createEnquiryPublicClient();
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('singleton_key', 'default')
    .maybeSingle();

  const social = (data?.social_links as Record<string, string> | null) ?? {};

  return {
    addressShort: data?.address_short ?? BRAND_CONTACT_DEFAULTS.addressShort,
    analytics: readAnalytics(data?.analytics),
    companyName: data?.company_name ?? BRAND_CONTACT_DEFAULTS.companyName,
    description: DEFAULT_DESCRIPTION,
    siteName: BRAND_SITE_NAME,
    email:
      process.env.NEXT_PUBLIC_BRAND_EMAIL?.trim() || data?.email || BRAND_CONTACT_DEFAULTS.email,
    faviconUrl: data?.favicon_url ?? BRAND_FAVICON_PATH,
    faviconVersion: data?.updated_at ?? null,
    logoUrl: data?.logo_url ?? null,
    ogImage: data?.og_default_image_url ?? null,
    phoneOffice: data?.phone_office || BRAND_CONTACT_DEFAULTS.phoneOffice,
    phonePrimary: data?.phone_primary || BRAND_CONTACT_DEFAULTS.phonePrimary,
    phoneSecondary: data?.phone_secondary || BRAND_CONTACT_DEFAULTS.phoneSecondary,
    postalAddress: data?.postal_address ?? BRAND_CONTACT_DEFAULTS.postalAddress,
    socialLinks: social,
    tagline: data?.tagline ?? null,
    themeColor: data?.theme_color ?? null,
    whatsappMessage: data?.whatsapp_message ?? BRAND_WHATSAPP.message
  };
}

/**
 * Per-page hero configuration (Portal > Settings > Hero Sections). Returns null
 * when a page has no custom hero, so callers fall back to their default media.
 */
export async function getPageHero(key: PageHeroKey): Promise<PageHero | null> {
  return unstable_cache(() => fetchPageHero(key), ['page-hero', key], {
    revalidate: 300,
    tags: ['page-heroes']
  })();
}

async function fetchPageHero(key: PageHeroKey): Promise<PageHero | null> {
  try {
    const supabase = createEnquiryPublicClient();
    const { data } = await supabase
      .from('site_settings')
      .select('page_heroes')
      .eq('singleton_key', 'default')
      .maybeSingle();

    const map = (data as { page_heroes?: Record<string, unknown> } | null)?.page_heroes ?? {};
    return normalizePageHero(map[key]);
  } catch {
    return null;
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return unstable_cache(fetchHeroSlides, ['hero-slides'], {
    revalidate: 300,
    tags: ['hero-slides']
  })();
}

async function fetchHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = createEnquiryPublicClient();
    const { data } = await supabase
      .from('site_settings')
      .select('hero_slides')
      .eq('singleton_key', 'default')
      .maybeSingle();

    const slides = normalizeHeroSlides((data as { hero_slides?: unknown } | null)?.hero_slides);
    return activeHeroSlides(slides);
  } catch {
    // Column may not exist yet (migration not applied). Hero falls back to defaults.
    return [];
  }
}

/** Published destinations for nav mega-menu, listings, and filters — fetch all, not a teaser subset. */
export const PUBLIC_DESTINATIONS_FETCH_LIMIT = 250;

export async function getPublicDestinations(
  locale: string,
  limit = PUBLIC_DESTINATIONS_FETCH_LIMIT
): Promise<PublicDestination[]> {
  return unstable_cache(
    () => fetchPublicDestinations(locale, limit),
    ['public-destinations', locale, String(limit)],
    {
      revalidate: 300,
      tags: ['destinations']
    }
  )();
}

async function fetchPublicDestinations(
  locale: string,
  limit = PUBLIC_DESTINATIONS_FETCH_LIMIT
): Promise<PublicDestination[]> {
  const supabase = createEnquiryPublicClient();
  const { data } = await supabase
    .from('destination_translations')
    .select(
      `
      slug,
      name,
      summary,
      destination:destinations!inner(id, country, region, status, gallery),
      og_image:media_assets!destination_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('destination.status', 'published')
    .not('published_at', 'is', null)
    .order('name')
    .limit(limit);

  const rows = data ?? [];
  const galleryIds = rows.flatMap((row) =>
    parseStringArray(unwrapRelation(row.destination)?.gallery)
  );
  const mediaById = await resolveMediaByIds(galleryIds);

  return rows.flatMap((row) => {
    const destination = unwrapRelation(row.destination);
    if (!destination) return [];

    // Cover preference: first gallery image, else the SEO/OG image.
    const coverId = parseStringArray(destination.gallery)[0];
    const cover = coverId ? mediaById.get(coverId) : null;

    return [
      {
        country: destination.country,
        href: localePath(locale, `/destinations/${row.slug}`),
        id: destination.id,
        imageAlt: cover?.alt ?? mediaAlt(row.og_image, row.name),
        imageUrl: cover?.url ?? mediaUrl(row.og_image),
        name: row.name,
        region: destination.region,
        slug: row.slug,
        summary: row.summary
      }
    ];
  });
}

/**
 * Published safari tours linked to a destination (via `tour_destinations`).
 * Returns [] when no tours are linked yet — the detail page shows an empty
 * state in that case.
 */
export async function getDestinationTours(
  locale: string,
  destinationId: string
): Promise<PublicTour[]> {
  const supabase = createEnquiryPublicClient();

  const { data: links } = await supabase
    .from('tour_destinations')
    .select('tour_id, position')
    .eq('destination_id', destinationId)
    .order('position', { ascending: true });

  const tourIds = (links ?? []).map((link) => link.tour_id as string);
  if (!tourIds.length) return [];

  const { data } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      tour:tours!inner(id, status, days, nights, price_from),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .in('tour_id', tourIds)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .order('title');

  return (data ?? []).flatMap((row) => {
    const tour = unwrapRelation(row.tour);
    if (!tour) return [];
    return [
      {
        days: tour.days,
        excerpt: row.excerpt,
        href: localePath(locale, `/tours/${row.slug}`),
        id: tour.id,
        imageAlt: mediaAlt(row.og_image, row.title),
        imageUrl: mediaUrl(row.og_image),
        nights: tour.nights,
        priceFrom: tour.price_from,
        slug: row.slug,
        title: row.title
      }
    ];
  });
}

/**
 * Published tours that share at least one destination with the given tour.
 * Excludes the current tour and caps results for detail-page carousels.
 */
export async function getSimilarToursForTour(
  locale: string,
  tourId: string,
  limit = 6
): Promise<PublicTour[]> {
  const supabase = createEnquiryPublicClient();

  const { data: destinationLinks } = await supabase
    .from('tour_destinations')
    .select('destination_id')
    .eq('tour_id', tourId);

  const destinationIds = [
    ...new Set(
      (destinationLinks ?? []).map((link) => link.destination_id as string).filter(Boolean)
    )
  ];
  if (!destinationIds.length) return [];

  const { data: tourLinks } = await supabase
    .from('tour_destinations')
    .select('tour_id, position')
    .in('destination_id', destinationIds)
    .neq('tour_id', tourId)
    .order('position', { ascending: true });

  const tourIds = [...new Set((tourLinks ?? []).map((link) => link.tour_id as string))].slice(
    0,
    limit
  );
  if (!tourIds.length) return [];

  const { data } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      tour:tours!inner(id, status, days, nights, price_from),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .in('tour_id', tourIds)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null);

  const order = new Map(tourIds.map((id, index) => [id, index]));

  return (data ?? [])
    .flatMap((row) => {
      const tour = unwrapRelation(row.tour);
      if (!tour) return [];
      return [
        {
          days: tour.days,
          excerpt: row.excerpt,
          href: localePath(locale, `/tours/${row.slug}`),
          id: tour.id,
          imageAlt: mediaAlt(row.og_image, row.title),
          imageUrl: mediaUrl(row.og_image),
          nights: tour.nights,
          priceFrom: tour.price_from,
          slug: row.slug,
          title: row.title
        }
      ];
    })
    .toSorted((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

/** Full destination detail (all wizard fields) for the public detail page. */
export async function getPublicDestinationDetail(
  locale: string,
  slug: string
): Promise<PublicDestinationDetail | null> {
  const supabase = createEnquiryPublicClient();

  const { data } = await supabase
    .from('destination_translations')
    .select(
      `
      slug,
      name,
      summary,
      description,
      seo_title,
      seo_description,
      faqs,
      destination:destinations!inner(id, country, region, status, best_time, wildlife, gallery),
      og_image:media_assets!destination_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('destination.status', 'published')
    .not('published_at', 'is', null)
    .maybeSingle();

  if (!data) return null;

  const destination = unwrapRelation(data.destination);
  if (!destination) return null;

  const galleryIds = parseStringArray(destination.gallery);
  const mediaById = await resolveMediaByIds(galleryIds);
  const gallery = galleryIds.flatMap((id) => {
    const asset = mediaById.get(id);
    return asset?.url ? [asset] : [];
  });

  const description = (data.description as { html?: string; text?: string } | null) ?? null;
  const bestTime = (destination.best_time as { summary?: string } | null) ?? null;

  return {
    bestTime: bestTime?.summary || null,
    country: destination.country,
    descriptionHtml: description?.html ?? description?.text ?? null,
    faqs: normalizeDirectAnswers(data.faqs),
    gallery,
    id: destination.id,
    imageAlt: mediaAlt(data.og_image, data.name),
    imageUrl: mediaUrl(data.og_image),
    name: data.name,
    region: destination.region,
    seoDescription: data.seo_description,
    seoTitle: data.seo_title,
    slug: data.slug,
    summary: data.summary,
    wildlife: parseStringArray(destination.wildlife)
  };
}

type TourTranslationListRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  overview?: unknown;
  faqs?: unknown;
  tour:
    | {
        id: string;
        status: string;
        days: number | null;
        nights: number | null;
        price_from: number | null;
        catalog_group?: string | null;
        countries?: string[] | null;
        start_location?: string | null;
        end_location?: string | null;
        important_notice?: string | null;
        itinerary_days?: unknown;
        route_waypoints?: unknown;
        inclusions?: unknown;
        exclusions?: unknown;
        gallery?: unknown;
      }
    | Array<{
        id: string;
        status: string;
        days: number | null;
        nights: number | null;
        price_from: number | null;
        catalog_group?: string | null;
        countries?: string[] | null;
        start_location?: string | null;
        end_location?: string | null;
        important_notice?: string | null;
        itinerary_days?: unknown;
        route_waypoints?: unknown;
        inclusions?: unknown;
        exclusions?: unknown;
        gallery?: unknown;
      }>
    | null;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{ alt?: string | null; url?: string | null }>
    | null;
};

async function getTourRelationLabelMaps(locale: string, tourIds: string[]) {
  const uniqueIds = [...new Set(tourIds.filter(Boolean))];
  const empty = {
    countries: new Map<string, string[]>(),
    destinations: new Map<string, string[]>(),
    experiences: new Map<string, string[]>(),
    parks: new Map<string, string[]>(),
    parkSlugs: new Map<string, string[]>()
  };
  if (!uniqueIds.length) return empty;

  const supabase = createEnquiryPublicClient();
  const [destinationLinksResult, experienceLinksResult, parkLinksResult] = await Promise.all([
    supabase
      .from('tour_destinations')
      .select('tour_id, destination_id, position')
      .in('tour_id', uniqueIds)
      .order('position', { ascending: true }),
    supabase
      .from('tour_experiences')
      .select('tour_id, experience_id, position')
      .in('tour_id', uniqueIds)
      .order('position', { ascending: true }),
    supabase
      .from('tour_national_parks')
      .select('tour_id, park_id, position')
      .in('tour_id', uniqueIds)
      .order('position', { ascending: true })
  ]);

  const destinationLinks = destinationLinksResult.data ?? [];
  const experienceLinks = experienceLinksResult.data ?? [];
  const parkLinks = parkLinksResult.data ?? [];
  const destinationIds = [
    ...new Set(destinationLinks.map((link) => link.destination_id as string).filter(Boolean))
  ];
  const experienceIds = [
    ...new Set(experienceLinks.map((link) => link.experience_id as string).filter(Boolean))
  ];
  const parkIds = [...new Set(parkLinks.map((link) => link.park_id as string).filter(Boolean))];

  const [destinationNamesResult, experienceNamesResult, parkNamesResult] = await Promise.all([
    destinationIds.length
      ? supabase
          .from('destination_translations')
          .select('destination_id, name, destination:destinations(country)')
          .eq('locale', locale)
          .in('destination_id', destinationIds)
      : Promise.resolve({ data: [] }),
    experienceIds.length
      ? supabase
          .from('experience_translations')
          .select('experience_id, title')
          .eq('locale', locale)
          .in('experience_id', experienceIds)
      : Promise.resolve({ data: [] }),
    parkIds.length
      ? supabase
          .from('national_park_translations')
          .select('park_id, name, slug')
          .eq('locale', locale)
          .in('park_id', parkIds)
      : Promise.resolve({ data: [] })
  ]);

  const destinationNameById = new Map(
    (destinationNamesResult.data ?? []).map((row) => [
      row.destination_id as string,
      row.name as string
    ])
  );
  const destinationCountryById = new Map(
    (destinationNamesResult.data ?? []).flatMap((row) => {
      const destination = unwrapRelation(
        row.destination as { country?: string | null } | Array<{ country?: string | null }> | null
      );
      return destination?.country
        ? [[row.destination_id as string, destination.country as string]]
        : [];
    })
  );
  const experienceNameById = new Map(
    (experienceNamesResult.data ?? []).map((row) => [
      row.experience_id as string,
      row.title as string
    ])
  );
  const parkNameById = new Map(
    (parkNamesResult.data ?? []).map((row) => [row.park_id as string, row.name as string])
  );
  const parkSlugById = new Map(
    (parkNamesResult.data ?? []).map((row) => [row.park_id as string, row.slug as string])
  );

  const countries = new Map<string, string[]>();
  const destinations = new Map<string, string[]>();
  for (const link of destinationLinks) {
    const tourId = link.tour_id as string;
    const label = destinationNameById.get(link.destination_id as string);
    if (label) destinations.set(tourId, [...(destinations.get(tourId) ?? []), label]);
    const country = destinationCountryById.get(link.destination_id as string);
    if (country && !(countries.get(tourId) ?? []).includes(country)) {
      countries.set(tourId, [...(countries.get(tourId) ?? []), country]);
    }
  }

  const experiences = new Map<string, string[]>();
  for (const link of experienceLinks) {
    const tourId = link.tour_id as string;
    const label = experienceNameById.get(link.experience_id as string);
    if (!label) continue;
    experiences.set(tourId, [...(experiences.get(tourId) ?? []), label]);
  }

  const parks = new Map<string, string[]>();
  const parkSlugs = new Map<string, string[]>();
  for (const link of parkLinks) {
    const tourId = link.tour_id as string;
    const label = parkNameById.get(link.park_id as string);
    const slug = parkSlugById.get(link.park_id as string);
    if (!label) continue;
    parks.set(tourId, [...(parks.get(tourId) ?? []), label]);
    if (slug) parkSlugs.set(tourId, [...(parkSlugs.get(tourId) ?? []), slug]);
  }

  return { countries, destinations, experiences, parks, parkSlugs };
}

async function getLegacyTourPricingMap(
  supabase: ReturnType<typeof createEnquiryPublicClient>,
  tourIds: string[]
) {
  const pricingByTourId = new Map<string, PublicTourPricingTier[]>();
  if (!tourIds.length) return pricingByTourId;

  const { data: tierRows } = await supabase
    .from('tour_pricing_tiers')
    .select('id, tour_id, tier, label, blurb, notes, currency, position')
    .in('tour_id', tourIds)
    .order('position', { ascending: true });

  const tiers = (tierRows ?? []) as Array<{
    id: string;
    tour_id: string;
    tier: ExperiencePricingTableKey;
    label: string | null;
    blurb: string | null;
    notes: string | null;
    currency: string | null;
    position: number | null;
  }>;
  const tierIds = tiers.map((tier) => tier.id);
  if (!tierIds.length) return pricingByTourId;

  const { data: seasonRows } = await supabase
    .from('tour_pricing_seasons')
    .select('id, tier_id, label, date_start, date_end, position')
    .in('tier_id', tierIds)
    .order('position', { ascending: true });

  const seasons = (seasonRows ?? []) as Array<{
    id: string;
    tier_id: string;
    label: string;
    date_start: string | null;
    date_end: string | null;
    position: number | null;
  }>;
  const seasonIds = seasons.map((season) => season.id);

  const { data: cellRows } = seasonIds.length
    ? await supabase
        .from('tour_pricing_cells')
        .select('season_id, group_band, band_position, price')
        .in('season_id', seasonIds)
        .order('band_position', { ascending: true })
    : { data: [] };

  const cellsBySeasonId = new Map<string, Map<string, number | null>>();
  for (const cell of cellRows ?? []) {
    const seasonId = cell.season_id as string;
    const groupBand = cell.group_band as string;
    if (!groupBand.trim()) continue;
    const seasonCells = cellsBySeasonId.get(seasonId) ?? new Map<string, number | null>();
    seasonCells.set(groupBand, toFiniteNumber(cell.price));
    cellsBySeasonId.set(seasonId, seasonCells);
  }

  function mapSeasonCells(seasonId: string): PublicTourPricingCell[] {
    const seasonCells = cellsBySeasonId.get(seasonId);
    if (!seasonCells?.size) {
      return LEGACY_PAX_BANDS.map((groupBand) => ({ groupBand, price: undefined }));
    }

    const cells = [...seasonCells.entries()].map(([groupBand, price]) => ({
      groupBand,
      price
    }));

    return mapPublicSeasonCells(cells);
  }

  const seasonsByTierId = new Map<string, PublicTourPricingSeason[]>();
  for (const season of seasons) {
    seasonsByTierId.set(season.tier_id, [
      ...(seasonsByTierId.get(season.tier_id) ?? []),
      {
        id: season.id,
        label: season.label,
        dateStart: season.date_start,
        dateEnd: season.date_end,
        cells: mapSeasonCells(season.id)
      }
    ]);
  }

  for (const tier of tiers) {
    const tierKey = tier.tier as ExperiencePricingTableKey;
    pricingByTourId.set(tier.tour_id, [
      ...(pricingByTourId.get(tier.tour_id) ?? []),
      {
        id: tier.id,
        tier: mapExperienceKeyToTourTier(tierKey),
        label: tier.label?.trim() || formatExperienceKeyLabel(tierKey),
        blurb: tier.blurb,
        notes: tier.notes,
        currency: tier.currency || 'USD',
        seasons: seasonsByTierId.get(tier.id) ?? []
      }
    ]);
  }

  return pricingByTourId;
}

async function getTourPricingMap(tourIds: string[]) {
  const uniqueIds = [...new Set(tourIds.filter(Boolean))];
  const pricingByTourId = new Map<string, PublicTourPricingTier[]>();
  if (!uniqueIds.length) return pricingByTourId;

  const supabase = createEnquiryPublicClient();

  const { data: tourRows } = await supabase
    .from('tours')
    .select('id, pricing_experience_id, pricing_table_keys')
    .in('id', uniqueIds);

  const experienceLinked: Array<{
    id: string;
    pricing_experience_id: string;
    pricing_table_keys: unknown;
  }> = [];
  const legacyTourIds: string[] = [];

  for (const row of tourRows ?? []) {
    const experienceId = row.pricing_experience_id as string | null;
    const keys = parsePricingTableKeys(row.pricing_table_keys);
    if (experienceId && keys.length) {
      experienceLinked.push({
        id: row.id as string,
        pricing_experience_id: experienceId,
        pricing_table_keys: keys
      });
    } else {
      legacyTourIds.push(row.id as string);
    }
  }

  if (experienceLinked.length) {
    const experienceIds = [...new Set(experienceLinked.map((row) => row.pricing_experience_id))];
    const { data: experienceRows } = await supabase
      .from('experiences')
      .select('id, package_pricing')
      .in('id', experienceIds);

    const pricingByExperienceId = new Map(
      (experienceRows ?? []).map((row) => [
        row.id as string,
        parseExperiencePackagePricing(row.package_pricing)
      ])
    );

    for (const tour of experienceLinked) {
      const levels = pricingByExperienceId.get(tour.pricing_experience_id) ?? [];
      const keys = parsePricingTableKeys(tour.pricing_table_keys);
      pricingByTourId.set(
        tour.id,
        mapExperienceLevelsToTourTiers(levels, keys, tour.pricing_experience_id)
      );
    }
  }

  if (legacyTourIds.length) {
    const legacyPricing = await getLegacyTourPricingMap(supabase, legacyTourIds);
    for (const [tourId, tiers] of legacyPricing) {
      pricingByTourId.set(tourId, tiers);
    }
  }

  return pricingByTourId;
}

function pricingBounds(
  tiers: PublicTourPricingTier[] | undefined,
  fallbackPrice: number | null
): { min: number | null; max: number | null } {
  const prices =
    tiers?.flatMap((tier) =>
      tier.seasons.flatMap((season) =>
        season.cells.flatMap((cell) => (cell.price != null ? [cell.price] : []))
      )
    ) ?? [];

  if (!prices.length) return { min: fallbackPrice, max: fallbackPrice };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function mapTourListRows(
  linkLocale: string,
  rows: TourTranslationListRow[],
  pricingByTourId: Map<string, PublicTourPricingTier[]>,
  relationLabels: Awaited<ReturnType<typeof getTourRelationLabelMaps>>,
  mediaById?: Map<string, PublicDestinationMedia>
): PublicTour[] {
  return rows.flatMap((row) => {
    const tour = unwrapRelation(row.tour);
    if (!tour) return [];

    const galleryIds = parseStringArray(tour.gallery);
    const cover = galleryIds[0] ? mediaById?.get(galleryIds[0]) : null;
    const pricingTiers = pricingByTourId.get(tour.id) ?? [];
    const bounds = pricingBounds(pricingTiers, tour.price_from);
    const countryIds = parseTourSafariMarkets(tour.countries);
    const countryLabels = countryIds.length
      ? countryIds.map(formatTourSafariMarketLabel)
      : (relationLabels.countries.get(tour.id) ?? []);

    return [
      {
        catalogGroup: typeof tour.catalog_group === 'string' ? tour.catalog_group : null,
        countryIds,
        countryLabels,
        days: tour.days,
        destinationLabels: relationLabels.destinations.get(tour.id) ?? [],
        excerpt: row.excerpt,
        experienceLabels: relationLabels.experiences.get(tour.id) ?? [],
        href: localePath(linkLocale, `/tours/${row.slug}`),
        id: tour.id,
        imageAlt: cover?.alt ?? mediaAlt(row.og_image, row.title),
        imageUrl: cover?.url ?? mediaUrl(row.og_image),
        maxPrice: bounds.max,
        minPrice: bounds.min,
        nights: tour.nights,
        parkLabels: relationLabels.parks.get(tour.id) ?? [],
        parkSlugs: relationLabels.parkSlugs.get(tour.id) ?? [],
        priceFrom: bounds.min ?? tour.price_from,
        pricingTiers,
        slug: row.slug,
        title: row.title
      }
    ];
  });
}

function buildTourCatalogFacets(tours: PublicTour[]): PublicTourCatalogFacets {
  const countrySlugs = new Set<string>();
  const destinationLabels = new Set<string>();
  const experienceLabels = new Set<string>();
  const parkOptions = new Map<string, string>();
  const pricingTiers = new Set<PublicTourPricingTier['tier']>();

  for (const tour of tours) {
    tour.countryIds?.forEach((slug) => countrySlugs.add(slug));
    tour.destinationLabels?.forEach((label) => destinationLabels.add(label));
    tour.experienceLabels?.forEach((label) => experienceLabels.add(label));
    tour.parkSlugs?.forEach((slug, index) => {
      const label = tour.parkLabels?.[index] ?? slug;
      parkOptions.set(slug, label);
    });
    tour.pricingTiers?.forEach((tier) => pricingTiers.add(tier.tier));
  }

  const collectionIds = PUBLIC_TOUR_COLLECTIONS.map((item) => item.id).filter((id) =>
    tours.some((tour) => tourMatchesCollection(tour, id))
  );

  return {
    collectionIds,
    countrySlugs: [...countrySlugs],
    destinationLabels: [...destinationLabels].toSorted((a, b) => a.localeCompare(b)),
    durationBounds: { ...TOUR_CATALOG_DURATION_BOUNDS },
    experienceLabels: [...experienceLabels].toSorted((a, b) => a.localeCompare(b)),
    parkOptions: [...parkOptions.entries()]
      .map(([slug, label]) => ({ slug, label }))
      .toSorted((a, b) => a.label.localeCompare(b.label)),
    priceBounds: { ...TOUR_CATALOG_PRICE_BOUNDS },
    pricingTiers: [...pricingTiers]
  };
}

async function fetchPublishedTourRows(
  locale: string,
  tourIds?: string[]
): Promise<TourTranslationListRow[]> {
  const supabase = createGenericClient();
  let query = supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      overview,
      excerpt,
      faqs,
      tour:tours!inner(
        id,
        status,
        days,
        nights,
        price_from,
        catalog_group,
        countries,
        start_location,
        end_location,
        important_notice,
        itinerary_days,
        route_waypoints,
        inclusions,
        exclusions,
        gallery
      ),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .order('title');

  if (tourIds?.length) {
    query = query.in('tour_id', tourIds);
  }

  const { data } = await query;
  return (data ?? []) as TourTranslationListRow[];
}

async function buildToursFromRows(
  locale: string,
  rows: TourTranslationListRow[],
  linkLocale = locale
) {
  const tourIds = rows.flatMap((row) => {
    const tour = unwrapRelation(row.tour);
    return tour?.id ? [tour.id] : [];
  });
  const galleryIds = rows.flatMap((row) => parseStringArray(unwrapRelation(row.tour)?.gallery));
  const [pricingByTourId, relationLabels, mediaById] = await Promise.all([
    getTourPricingMap(tourIds),
    getTourRelationLabelMaps(locale, tourIds),
    resolveMediaByIds(galleryIds)
  ]);

  return mapTourListRows(linkLocale, rows, pricingByTourId, relationLabels, mediaById);
}

export async function getPublicTourCatalog(
  locale: string,
  filters: PublicTourCatalogFilters = {}
): Promise<{ facets: PublicTourCatalogFacets; tours: PublicTour[] }> {
  const { contentLocale, rows } = await resolvePublishedContentLocale(locale, (resolvedLocale) =>
    fetchPublishedTourRows(resolvedLocale)
  );
  const allTours = await buildToursFromRows(locale, rows, contentLocale);
  const facets = buildTourCatalogFacets(allTours);

  const tours = allTours
    .filter((tour) => tourMatchesFilters(tour, filters))
    .toSorted((a, b) => a.title.localeCompare(b.title));

  return { facets, tours };
}

export async function getPublicTours(locale: string, limit = 6): Promise<PublicTour[]> {
  return unstable_cache(
    () => fetchPublicTours(locale, limit),
    ['public-tours-v2', locale, String(limit)],
    {
      revalidate: 300,
      tags: ['tours']
    }
  )();
}

async function fetchPublicTours(locale: string, limit = 6): Promise<PublicTour[]> {
  const { contentLocale, rows } = await resolvePublishedContentLocale(locale, (resolvedLocale) =>
    fetchPublishedTourRows(resolvedLocale)
  );
  return buildToursFromRows(locale, rows.slice(0, limit), contentLocale);
}

export async function getPublicToursByIds(
  locale: string,
  tourIds: string[]
): Promise<PublicTour[]> {
  if (!tourIds.length) return [];
  const { contentLocale, rows } = await resolvePublishedContentLocale(locale, (resolvedLocale) =>
    fetchPublishedTourRows(resolvedLocale, tourIds)
  );
  return buildToursFromRows(locale, rows, contentLocale);
}

async function getRouteAccommodations(
  locale: string,
  tourId: string
): Promise<PublicAccommodation[]> {
  const supabase = createEnquiryPublicClient();
  const { data: links } = await supabase
    .from('tour_accommodations')
    .select('accommodation_id, position')
    .eq('tour_id', tourId)
    .order('position', { ascending: true });

  const ids = (links ?? []).map((link) => link.accommodation_id as string).filter(Boolean);
  if (!ids.length) return [];

  const order = new Map(ids.map((id, index) => [id, index]));
  const all = await listPublishedAccommodations({ locale });
  return all
    .filter((accommodation) => ids.includes(accommodation.id))
    .toSorted((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getDestinationAccommodations(
  locale: string,
  destinationId: string
): Promise<PublicAccommodation[]> {
  const supabase = createEnquiryPublicClient();
  const { data: tourLinks } = await supabase
    .from('tour_destinations')
    .select('tour_id, position')
    .eq('destination_id', destinationId)
    .order('position', { ascending: true });

  const tourIds = [...new Set((tourLinks ?? []).map((link) => link.tour_id as string))];
  if (!tourIds.length) return [];

  const { data: accommodationLinks } = await supabase
    .from('tour_accommodations')
    .select('accommodation_id, position')
    .in('tour_id', tourIds)
    .order('position', { ascending: true });

  const ids = [
    ...new Set(
      (accommodationLinks ?? []).map((link) => link.accommodation_id as string).filter(Boolean)
    )
  ];
  if (!ids.length) return [];

  const order = new Map(ids.map((id, index) => [id, index]));
  const all = await listPublishedAccommodations({ locale });
  return all
    .filter((accommodation) => ids.includes(accommodation.id))
    .toSorted((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getPublicTourDetail(
  locale: string,
  slug: string
): Promise<PublicTourDetail | null> {
  const supabase = createGenericClient();
  let contentLocale = locale;
  let { data } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      overview,
      faqs,
      tour:tours!inner(
        id,
        status,
        days,
        nights,
        price_from,
        countries,
        start_location,
        end_location,
        important_notice,
        itinerary_days,
        route_waypoints,
        inclusions,
        exclusions,
        gallery
      ),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .maybeSingle<TourTranslationListRow>();

  if (!data && locale !== DEFAULT_LOCALE) {
    contentLocale = DEFAULT_LOCALE;
    ({ data } = await supabase
      .from('tour_translations')
      .select(
        `
      slug,
      title,
      excerpt,
      overview,
      faqs,
      tour:tours!inner(
        id,
        status,
        days,
        nights,
        price_from,
        countries,
        start_location,
        end_location,
        important_notice,
        itinerary_days,
        route_waypoints,
        inclusions,
        exclusions,
        gallery
      ),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
      )
      .eq('locale', DEFAULT_LOCALE)
      .eq('slug', slug)
      .eq('tour.status', 'published')
      .not('published_at', 'is', null)
      .maybeSingle<TourTranslationListRow>());
  }

  if (!data) return null;

  const [summary] = await buildToursFromRows(locale, [data], contentLocale);
  const tour = unwrapRelation(data.tour);
  if (!summary || !tour) return null;

  const galleryIds = parseStringArray(tour.gallery);
  const itineraryDaysRaw = parseItineraryDays(tour.itinerary_days);
  const itineraryImageIds = itineraryDaysRaw.map((day) => day.imageId).filter(Boolean);
  const mediaById = await resolveMediaByIds([...new Set([...galleryIds, ...itineraryImageIds])]);
  const gallery = galleryIds.flatMap((id) => {
    const asset = mediaById.get(id);
    return asset?.url ? [asset] : [];
  });
  const itineraryDays = itineraryDaysRaw.map((day) => {
    const asset = day.imageId ? mediaById.get(day.imageId) : null;
    return {
      ...day,
      imageUrl: asset?.url ?? null,
      imageAlt: asset?.alt ?? null
    };
  });

  return {
    ...summary,
    accommodations: await getRouteAccommodations(locale, summary.id),
    descriptionHtml: parseRichTextHtml(data.overview),
    endLocation: tour.end_location ?? null,
    exclusions: parseStringArray(tour.exclusions),
    faqs: normalizeDirectAnswers(data.faqs),
    gallery,
    importantNotice: tour.important_notice ?? null,
    inclusions: parseStringArray(tour.inclusions),
    itineraryDays,
    routeLegs: parseRouteLegs(tour.route_waypoints),
    startLocation: tour.start_location ?? null
  };
}

type PackageTranslationRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  content?: unknown;
  package:
    | {
        id: string;
        status: string;
        package_group: string | null;
        comfort_tier: PublicTourPricingTier['tier'] | null;
        tour_id: string | null;
      }
    | Array<{
        id: string;
        status: string;
        package_group: string | null;
        comfort_tier: PublicTourPricingTier['tier'] | null;
        tour_id: string | null;
      }>
    | null;
  og_image?:
    | { alt?: string | null; url?: string | null }
    | Array<{ alt?: string | null; url?: string | null }>
    | null;
};

async function fetchPublishedPackageRows(
  locale: string,
  slug?: string
): Promise<PackageTranslationRow[]> {
  const supabase = createEnquiryPublicClient();
  let query = supabase
    .from('package_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      content,
      package:packages!inner(id, status, package_group, comfort_tier, tour_id),
      og_image:media_assets!package_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('package.status', 'published')
    .not('published_at', 'is', null)
    .order('title');

  if (slug) query = query.eq('slug', slug);

  const { data } = await query;
  return (data ?? []) as PackageTranslationRow[];
}

function mapPackageRows(
  linkLocale: string,
  rows: PackageTranslationRow[],
  toursById: Map<string, PublicTour>
): PublicPackage[] {
  return rows.flatMap((row) => {
    const base = unwrapRelation(row.package);
    if (!base) return [];
    const tour = base.tour_id ? (toursById.get(base.tour_id) ?? null) : null;
    const tierPrice =
      base.comfort_tier && tour?.pricingTiers
        ? pricingBounds(
            tour.pricingTiers.filter((tier) => tier.tier === base.comfort_tier),
            tour.priceFrom
          ).min
        : null;

    return [
      {
        comfortTier: base.comfort_tier,
        excerpt: row.excerpt ?? tour?.excerpt ?? null,
        group: base.package_group,
        href: localePath(linkLocale, `/safari-packages/${row.slug}`),
        id: base.id,
        imageAlt: mediaAlt(row.og_image, row.title) ?? tour?.imageAlt ?? row.title,
        imageUrl: mediaUrl(row.og_image) ?? tour?.imageUrl ?? null,
        priceFrom: tierPrice ?? tour?.priceFrom ?? null,
        slug: row.slug,
        title: row.title,
        tour
      }
    ];
  });
}

export async function getPublicPackages(locale: string, limit = 24): Promise<PublicPackage[]> {
  const { contentLocale, rows } = await resolvePublishedContentLocale(locale, (resolvedLocale) =>
    fetchPublishedPackageRows(resolvedLocale)
  );
  const limitedRows = rows.slice(0, limit);
  const tourIds = [
    ...new Set(
      limitedRows
        .map((row) => unwrapRelation(row.package)?.tour_id)
        .filter((id): id is string => typeof id === 'string')
    )
  ];
  const tours = await getPublicToursByIds(locale, tourIds);
  const toursById = new Map(tours.map((tour) => [tour.id, tour]));
  return mapPackageRows(contentLocale, limitedRows, toursById);
}

export async function getPublicPackageDetail(
  locale: string,
  slug: string
): Promise<PublicPackageDetail | null> {
  let contentLocale = locale;
  let [row] = await fetchPublishedPackageRows(locale, slug);
  if (!row && locale !== DEFAULT_LOCALE) {
    contentLocale = DEFAULT_LOCALE;
    [row] = await fetchPublishedPackageRows(DEFAULT_LOCALE, slug);
  }
  if (!row) return null;

  const base = unwrapRelation(row.package);
  const linkedTour = base?.tour_id
    ? await getPublicTourDetail(
        contentLocale,
        (await getPublicToursByIds(contentLocale, [base.tour_id]))[0]?.slug ?? ''
      )
    : null;
  const toursById = new Map(linkedTour ? [[linkedTour.id, linkedTour as PublicTour]] : []);
  const [summary] = mapPackageRows(contentLocale, [row], toursById);
  if (!summary) return null;

  const pricingTier =
    linkedTour?.pricingTiers?.find((tier) => tier.tier === summary.comfortTier) ?? null;

  return {
    ...summary,
    contentHtml: parseRichTextHtml(row.content),
    linkedTour,
    pricingTier
  };
}

export async function getPublicBlogPosts(locale: string, limit = 3): Promise<PublicBlogPost[]> {
  return unstable_cache(
    () => fetchPublicBlogPosts(locale, limit),
    ['public-blog-posts-v3', locale, String(limit)],
    {
      revalidate: 300,
      tags: ['blog-posts']
    }
  )();
}

async function fetchPublicBlogPosts(locale: string, limit = 3): Promise<PublicBlogPost[]> {
  const supabase = createEnquiryPublicClient();

  async function queryPosts(resolvedLocale: string) {
    const { data } = await supabase
      .from('blog_translations')
      .select(
        `
      slug,
      title,
      excerpt,
      published_at,
      post:blog_posts!inner(
        id,
        status,
        deleted_at,
        featured,
        primary_category:blog_categories!blog_posts_primary_category_id_fkey(name)
      ),
      og_image:media_assets!blog_translations_og_image_id_fkey(url, alt)
    `
      )
      .eq('locale', resolvedLocale)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(Math.max(limit * 6, 12));

    return (data ?? [])
      .flatMap((row) => {
        const post = unwrapRelation(row.post) as {
          deleted_at: string | null;
          featured?: boolean;
          id: string;
          primary_category?: unknown;
          status: string;
        } | null;
        if (!post || post.status !== 'published' || post.deleted_at) return [];

        const category = unwrapRelation(post.primary_category) as { name?: string } | null;

        return [
          {
            category: category?.name ?? null,
            excerpt: row.excerpt,
            featured: Boolean(post.featured),
            href: localePath(locale, `/blog/${row.slug}`),
            id: post.id,
            imageAlt: mediaAlt(row.og_image, row.title),
            imageUrl: mediaUrl(row.og_image),
            publishedAt: row.published_at,
            slug: row.slug,
            title: row.title
          }
        ];
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return bTime - aTime;
      })
      .slice(0, limit)
      .map(({ featured: _featured, ...post }) => post);
  }

  const localized = await queryPosts(locale);
  if (localized.length || locale === DEFAULT_LOCALE) return localized;

  return queryPosts(DEFAULT_LOCALE);
}

export async function getHomeReviews(limit = 12): Promise<HomeReviewItem[]> {
  return unstable_cache(() => fetchHomeReviews(limit), ['home-reviews-google', String(limit)], {
    revalidate: 300,
    tags: ['reviews']
  })();
}

async function fetchHomeReviews(limit = 12): Promise<HomeReviewItem[]> {
  const supabase = createEnquiryPublicClient();
  const { data } = await supabase
    .from('reviews')
    .select('id, author_name, author_location, rating, source, body, review_date, avatar_url')
    .eq('status', 'published')
    .eq('featured', true)
    .eq('source', 'google')
    .order('position', { ascending: true })
    .order('review_date', { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    authorLocation: row.author_location,
    rating: row.rating,
    source: row.source === 'google' ? 'google' : 'tripadvisor',
    body: row.body,
    reviewDate: row.review_date,
    avatarUrl: row.avatar_url
  }));
}
