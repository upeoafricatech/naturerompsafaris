'use client';

import { useEffect, useState } from 'react';

import { TourCard } from '@/components/public/cards/content-cards';
import { EmptyState, ListingShell } from '@/components/public/page-shell';
import {
  TourCatalogFilters,
  buildTourCatalogQuery,
  type TourCatalogActive
} from '@/components/public/tours/tour-catalog-filters';
import { localePath } from '@/lib/public/locale-path';
import { tourMatchesFilters, type TourCatalogTour } from '@/lib/public/tour-catalog-match';
import { publicTourCollectionLabel } from '@/lib/public/tour-collections';
import { tourCountryLabelFromSlug } from '@/lib/public/tour-format';
import type { PublicTourCatalogFacets } from '@/lib/public/types';

type TourCatalogBrowserProps = {
  facets: PublicTourCatalogFacets;
  initialFilters: TourCatalogActive;
  locale: string;
  tours: TourCatalogTour[];
};

function optionalNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function queriesMatch(left: string, right: string) {
  const a = new URLSearchParams(left);
  const b = new URLSearchParams(right);
  a.sort();
  b.sort();
  return a.toString() === b.toString();
}

function replaceCatalogUrl(href: string) {
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === href) return;
  window.history.replaceState(window.history.state, '', href);
}

export function TourCatalogBrowser({
  facets,
  initialFilters,
  locale,
  tours
}: TourCatalogBrowserProps) {
  const [filters, setFilters] = useState(initialFilters);
  const basePath = localePath(locale, '/tours');
  const initialQuery = buildTourCatalogQuery(initialFilters);

  useEffect(() => {
    const current = window.location.search.replace(/^\?/, '');
    if (!queriesMatch(initialQuery, current)) return;
    setFilters((currentFilters) =>
      queriesMatch(buildTourCatalogQuery(currentFilters), initialQuery)
        ? currentFilters
        : initialFilters
    );
  }, [initialFilters, initialQuery]);
  const visibleTours = tours.filter((tour) =>
    tourMatchesFilters(tour, {
      collection: filters.collection,
      country: filters.country,
      destination: filters.destination,
      durationMax: optionalNumber(filters.durationMax),
      durationMin: optionalNumber(filters.durationMin),
      experience: filters.experience,
      park: filters.park,
      priceMax: optionalNumber(filters.priceMax),
      priceMin: optionalNumber(filters.priceMin),
      pricingTiers: filters.pricingTiers
    })
  );
  const listingTitle =
    publicTourCollectionLabel(filters.collection) ||
    (filters.country ? tourCountryLabelFromSlug(filters.country) : '') ||
    'Safari Tours';
  const hasFilters = buildTourCatalogQuery(filters).length > 0;

  function apply(next: TourCatalogActive) {
    setFilters(next);
    const query = buildTourCatalogQuery(next);
    replaceCatalogUrl(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <ListingShell
      filters={<TourCatalogFilters active={filters} facets={facets} onChange={apply} />}
    >
      <div className='mb-6 flex items-baseline justify-between gap-3'>
        <h2 className='brand-heading font-display text-2xl'>{listingTitle}</h2>
        <span className='text-sm text-[var(--brand-muted)]'>
          {visibleTours.length} {visibleTours.length === 1 ? 'tour' : 'tours'} found
        </span>
      </div>
      {visibleTours.length ? (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {visibleTours.map((tour) => (
            <TourCard
              item={{
                days: tour.days,
                excerpt: tour.excerpt,
                href: tour.href,
                imageAlt: tour.imageAlt,
                imageUrl: tour.imageUrl,
                nights: tour.nights,
                priceFrom: tour.priceFrom,
                title: tour.title
              }}
              key={tour.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          actionHref={hasFilters ? basePath : localePath(locale, '/contact')}
          actionLabel={hasFilters ? 'Clear filters' : 'Plan a Custom Safari'}
          message={
            hasFilters
              ? 'No tours match these filters. Widen the duration or price range, or clear filters to see all safaris.'
              : 'Published tours will appear here once they are added through the Nature Romp CMS.'
          }
          title={hasFilters ? 'No tours match' : 'No tours published yet'}
        />
      )}
    </ListingShell>
  );
}
