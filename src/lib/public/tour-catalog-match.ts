import { TOUR_SAFARI_MARKET_IDS } from '@/features/experiences/public/tour-markets';

import { tourMatchesCollection } from './tour-collections';
import { tourCountryLabelFromSlug } from './tour-format';
import type { PublicTourCatalogFilters, PublicTourPricingTier } from './types';

const SAFARI_MARKET_IDS = new Set<string>(TOUR_SAFARI_MARKET_IDS);

export type TourCatalogMatchInput = {
  catalogGroup?: string | null;
  countryIds?: readonly string[];
  countryLabels?: readonly string[];
  days?: number | null;
  destinationLabels?: readonly string[];
  experienceLabels?: readonly string[];
  maxPrice?: number | null;
  minPrice?: number | null;
  parkSlugs?: readonly string[];
  priceFrom?: number | null;
  pricingTiers?: readonly { tier: PublicTourPricingTier['tier'] }[];
};

export type TourCatalogTour = TourCatalogMatchInput & {
  excerpt: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  nights: number | null;
  title: string;
};

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

export function tourMatchesFilters(
  tour: TourCatalogMatchInput,
  filters: PublicTourCatalogFilters
): boolean {
  if (filters.collection && !tourMatchesCollection(tour, filters.collection)) return false;

  const destinationFilters = filters.destination?.map(normalizeFilterValue) ?? [];
  const experienceFilters = filters.experience?.map(normalizeFilterValue) ?? [];
  const parkFilters = filters.park?.map(normalizeFilterValue) ?? [];
  const tierFilters = filters.pricingTiers ?? [];

  if (filters.country) {
    const slug = filters.country;
    const tourCountries = tour.countryIds ?? [];
    if (tourCountries.length) {
      if (!SAFARI_MARKET_IDS.has(slug) || !tourCountries.includes(slug)) return false;
    } else {
      const countryLabel = tourCountryLabelFromSlug(filters.country);
      if (
        countryLabel &&
        !tour.countryLabels?.some(
          (label) => normalizeFilterValue(label) === normalizeFilterValue(countryLabel)
        )
      ) {
        return false;
      }
    }
  }

  if (
    destinationFilters.length &&
    !tour.destinationLabels?.some((label) =>
      destinationFilters.includes(normalizeFilterValue(label))
    )
  ) {
    return false;
  }

  if (
    experienceFilters.length &&
    !tour.experienceLabels?.some((label) => experienceFilters.includes(normalizeFilterValue(label)))
  ) {
    return false;
  }

  if (
    parkFilters.length &&
    !tour.parkSlugs?.some((slug) => parkFilters.includes(normalizeFilterValue(slug)))
  ) {
    return false;
  }

  if (tierFilters.length && !tour.pricingTiers?.some((tier) => tierFilters.includes(tier.tier))) {
    return false;
  }

  if (filters.durationMin != null && (tour.days ?? 0) < filters.durationMin) return false;
  if (filters.durationMax != null && (tour.days ?? Number.MAX_SAFE_INTEGER) > filters.durationMax) {
    return false;
  }

  const tourLow = tour.minPrice ?? tour.priceFrom ?? null;
  const tourHigh = tour.maxPrice ?? tour.priceFrom ?? null;
  if (filters.priceMin != null || filters.priceMax != null) {
    if (tourLow == null && tourHigh == null) return false;
    const low = tourLow ?? tourHigh ?? 0;
    const high = tourHigh ?? tourLow ?? 0;
    if (filters.priceMin != null && high < filters.priceMin) return false;
    if (filters.priceMax != null && low > filters.priceMax) return false;
  }

  return true;
}
