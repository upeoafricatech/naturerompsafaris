import type { Metadata } from 'next';

import { PublicPageHero } from '@/components/public/public-page-hero';
import { TourCatalogBrowser } from '@/components/public/tours/tour-catalog-browser';
import type { TourCatalogActive } from '@/components/public/tours/tour-catalog-filters';
import { BRAND_PUBLIC_HERO_IMAGES } from '@/config/brand';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicTourCatalog } from '@/lib/public/site-data';
import type { TourCatalogTour } from '@/lib/public/tour-catalog-match';
import { isPublicTourCollectionId } from '@/lib/public/tour-collections';
import { TOUR_CATALOG_COUNTRIES } from '@/lib/public/tour-format';
import type { PublicTour, PublicTourPricingTier } from '@/lib/public/types';
import { buildListingPageMetadata, hasSearchParams } from '@/lib/seo/listing-metadata';

const toursPageTitle = 'Safari Tours & Itineraries';
const toursPageDescription =
  'Find the safari that fits you. Nature Romp Safaris brings together expert-led tours across Kenya, Tanzania, Uganda, Rwanda, and South Africa, so you can compare trip lengths, prices, and routes at your own pace.';

type ToursPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    collection?: string;
    country?: string;
    destination?: string;
    duration_max?: string;
    duration_min?: string;
    experience?: string;
    park?: string;
    price_max?: string;
    price_min?: string;
    tier?: string;
  }>;
};

function parseFilterList(value?: string) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((item) => decodeURIComponent(item.trim()))
    .filter(Boolean);
}

function parseTierList(value?: string): PublicTourPricingTier['tier'][] {
  return parseFilterList(value).filter(
    (tier): tier is PublicTourPricingTier['tier'] =>
      tier === 'budget' || tier === 'mid_range' || tier === 'luxury'
  );
}

function parseCollection(value?: string) {
  const id = value?.trim();
  if (!id || !isPublicTourCollectionId(id)) return undefined;
  return id;
}

function parseCountry(value?: string) {
  const slug = value?.trim();
  if (!slug) return undefined;
  return TOUR_CATALOG_COUNTRIES.some((item) => item.slug === slug) ? slug : undefined;
}

function toCatalogTour(tour: PublicTour): TourCatalogTour {
  return {
    catalogGroup: tour.catalogGroup ?? null,
    countryIds: tour.countryIds ?? [],
    countryLabels: tour.countryLabels ?? [],
    days: tour.days,
    destinationLabels: tour.destinationLabels ?? [],
    excerpt: tour.excerpt,
    experienceLabels: tour.experienceLabels ?? [],
    href: tour.href,
    id: tour.id,
    imageAlt: tour.imageAlt,
    imageUrl: tour.imageUrl,
    maxPrice: tour.maxPrice ?? null,
    minPrice: tour.minPrice ?? null,
    nights: tour.nights,
    parkSlugs: tour.parkSlugs ?? [],
    priceFrom: tour.priceFrom,
    pricingTiers: (tour.pricingTiers ?? []).map((tier) => ({ tier: tier.tier })),
    title: tour.title
  };
}

export async function generateMetadata({
  params,
  searchParams
}: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;
  const query = await searchParams;

  return buildListingPageMetadata({
    canonicalPath: `/${locale}/tours`,
    defaultDescription: toursPageDescription,
    defaultTitle: toursPageTitle,
    hasFilters: hasSearchParams(query),
    heroKey: 'tours',
    locale
  });
}

export default async function ToursPage({ params, searchParams }: ToursPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const initialFilters: TourCatalogActive = {
    collection: parseCollection(query.collection),
    country: parseCountry(query.country),
    destination: parseFilterList(query.destination),
    durationMax: query.duration_max?.trim() || undefined,
    durationMin: query.duration_min?.trim() || undefined,
    experience: parseFilterList(query.experience),
    park: parseFilterList(query.park),
    priceMax: query.price_max?.trim() || undefined,
    priceMin: query.price_min?.trim() || undefined,
    pricingTiers: parseTierList(query.tier)
  };

  const [{ tours, facets }, pageHero] = await Promise.all([
    getPublicTourCatalog(locale),
    getPageHero('tours')
  ]);
  const hero = BRAND_PUBLIC_HERO_IMAGES.tours;

  return (
    <>
      <PublicPageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Safari Tours' }]}
        description={toursPageDescription}
        eyebrow='Safari Tours'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        overlayTone='black'
        title={toursPageTitle}
      />
      <TourCatalogBrowser
        facets={facets}
        initialFilters={initialFilters}
        locale={locale}
        tours={tours.map(toCatalogTour)}
      />
    </>
  );
}
