'use client';

import * as React from 'react';

import {
  ListingFilterDropdown,
  ListingFilterGroup,
  ListingFilterOption,
  ListingFilterRange,
  ListingFilters,
  toggleFilterValue
} from '@/components/public/listing-filters';
import type { PublicTourCatalogFacets, PublicTourPricingTier } from '@/lib/public/types';
import { PUBLIC_TOUR_COLLECTIONS } from '@/lib/public/tour-collections';
import {
  formatComfortTierLabel,
  TOUR_CATALOG_COUNTRIES,
  TOUR_CATALOG_DURATION_BOUNDS,
  TOUR_CATALOG_PRICE_BOUNDS,
  TOUR_COMFORT_TIERS
} from '@/lib/public/tour-format';

export type TourCatalogActive = {
  collection?: string;
  country?: string;
  destination: string[];
  durationMax?: string;
  durationMin?: string;
  experience: string[];
  park: string[];
  priceMax?: string;
  priceMin?: string;
  pricingTiers: PublicTourPricingTier['tier'][];
};

type TourCatalogFiltersProps = {
  active: TourCatalogActive;
  facets: PublicTourCatalogFacets;
  onChange: (next: TourCatalogActive) => void;
};

export function buildTourCatalogQuery(active: TourCatalogActive) {
  const params = new URLSearchParams();
  if (active.collection) params.set('collection', active.collection);
  if (active.country) params.set('country', active.country);
  if (active.destination.length) params.set('destination', active.destination.join(','));
  if (active.experience.length) params.set('experience', active.experience.join(','));
  if (active.park.length) params.set('park', active.park.join(','));
  if (active.pricingTiers.length) params.set('tier', active.pricingTiers.join(','));
  if (active.durationMin) params.set('duration_min', active.durationMin);
  if (active.durationMax) params.set('duration_max', active.durationMax);
  if (active.priceMin) params.set('price_min', active.priceMin);
  if (active.priceMax) params.set('price_max', active.priceMax);
  return params.toString();
}

function asNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function countActiveFilters(active: TourCatalogActive) {
  return (
    (active.collection ? 1 : 0) +
    (active.country ? 1 : 0) +
    (active.destination?.length ?? 0) +
    (active.experience?.length ?? 0) +
    (active.park?.length ?? 0) +
    (active.pricingTiers?.length ?? 0) +
    (active.durationMin || active.durationMax ? 1 : 0) +
    (active.priceMin || active.priceMax ? 1 : 0)
  );
}

export const EMPTY_TOUR_FILTERS: TourCatalogActive = {
  collection: undefined,
  country: undefined,
  destination: [],
  durationMax: undefined,
  durationMin: undefined,
  experience: [],
  park: [],
  priceMax: undefined,
  priceMin: undefined,
  pricingTiers: []
};

export function TourCatalogFilters({ active, facets, onChange }: TourCatalogFiltersProps) {
  const normalizedActive = {
    ...active,
    destination: active.destination ?? [],
    experience: active.experience ?? [],
    park: active.park ?? [],
    pricingTiers: active.pricingTiers ?? []
  };
  const activeRef = React.useRef(normalizedActive);
  activeRef.current = normalizedActive;
  const destination = normalizedActive.destination;
  const experience = normalizedActive.experience;
  const park = normalizedActive.park;
  const pricingTiers = normalizedActive.pricingTiers;

  const durationMin = facets.durationBounds?.min ?? TOUR_CATALOG_DURATION_BOUNDS.min;
  const durationMax = facets.durationBounds?.max ?? TOUR_CATALOG_DURATION_BOUNDS.max;
  const priceMin = facets.priceBounds?.min ?? TOUR_CATALOG_PRICE_BOUNDS.min;
  const priceMax = facets.priceBounds?.max ?? TOUR_CATALOG_PRICE_BOUNDS.max;

  const [durationRange, setDurationRange] = React.useState<[number, number]>([
    asNumber(active.durationMin, durationMin),
    asNumber(active.durationMax, durationMax)
  ]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    asNumber(active.priceMin, priceMin),
    asNumber(active.priceMax, priceMax)
  ]);

  React.useEffect(() => {
    setDurationRange([
      asNumber(active.durationMin, durationMin),
      asNumber(active.durationMax, durationMax)
    ]);
  }, [active.durationMin, active.durationMax, durationMin, durationMax]);

  React.useEffect(() => {
    setPriceRange([asNumber(active.priceMin, priceMin), asNumber(active.priceMax, priceMax)]);
  }, [active.priceMin, active.priceMax, priceMin, priceMax]);

  function update(partial: Partial<TourCatalogActive>) {
    const next = { ...activeRef.current, ...partial };
    activeRef.current = next;
    onChange(next);
  }

  const collections = PUBLIC_TOUR_COLLECTIONS.filter(
    (item) => facets.collectionIds.includes(item.id) || item.id === normalizedActive.collection
  );

  const countries = TOUR_CATALOG_COUNTRIES.filter(
    ({ slug }) => !facets.countrySlugs?.length || facets.countrySlugs.includes(slug)
  );

  const visibleTiers = TOUR_COMFORT_TIERS.filter(
    (tier) => !facets.pricingTiers?.length || facets.pricingTiers.includes(tier.value)
  );

  const activeCount = countActiveFilters(normalizedActive);

  return (
    <ListingFilters
      activeCount={activeCount}
      clearLabel='Clear all'
      onClear={() => {
        setDurationRange([durationMin, durationMax]);
        setPriceRange([priceMin, priceMax]);
        update(EMPTY_TOUR_FILTERS);
      }}
      title='Safari tours'
    >
      {collections.length ? (
        <ListingFilterGroup title='Safari type'>
          <ListingFilterOption
            checked={!normalizedActive.collection}
            id='tour-collection-all'
            label='All safari types'
            name='tour-collection'
            type='radio'
            onChange={() => update({ collection: undefined })}
          />
          {collections.map((item) => (
            <ListingFilterOption
              checked={normalizedActive.collection === item.id}
              id={`tour-collection-${item.id}`}
              key={item.id}
              label={item.label}
              name='tour-collection'
              type='radio'
              onChange={() => update({ collection: item.id })}
            />
          ))}
        </ListingFilterGroup>
      ) : null}

      <ListingFilterGroup title='Country'>
        <ListingFilterOption
          checked={!normalizedActive.country}
          id='tour-country-all'
          label='All countries'
          name='tour-country'
          type='radio'
          onChange={() => update({ country: undefined })}
        />
        {countries.map(({ country, slug }) => (
          <ListingFilterOption
            checked={normalizedActive.country === slug}
            id={`tour-country-${slug}`}
            key={slug}
            label={country}
            name='tour-country'
            type='radio'
            onChange={() => update({ country: slug })}
          />
        ))}
      </ListingFilterGroup>

      {facets.destinationLabels.length ? (
        <ListingFilterDropdown
          selectedCount={destination.length}
          title='Destinations'
          triggerLabel='Select destinations'
        >
          {facets.destinationLabels.map((label) => (
            <ListingFilterOption
              checked={destination.includes(label)}
              id={`tour-destination-${label.replace(/\W+/g, '-').toLowerCase()}`}
              key={label}
              label={label}
              onChange={() =>
                update({
                  destination: toggleFilterValue(activeRef.current.destination, label)
                })
              }
            />
          ))}
        </ListingFilterDropdown>
      ) : null}

      {facets.parkOptions.length ? (
        <ListingFilterDropdown
          selectedCount={park.length}
          title='National parks'
          triggerLabel='Select parks'
        >
          {facets.parkOptions.map((item) => (
            <ListingFilterOption
              checked={park.includes(item.slug)}
              id={`tour-park-${item.slug}`}
              key={item.slug}
              label={item.label}
              onChange={() =>
                update({ park: toggleFilterValue(activeRef.current.park, item.slug) })
              }
            />
          ))}
        </ListingFilterDropdown>
      ) : null}

      {facets.experienceLabels.length ? (
        <ListingFilterDropdown
          selectedCount={experience.length}
          title='Safari adventures'
          triggerLabel='Select adventures'
        >
          {facets.experienceLabels.map((label) => (
            <ListingFilterOption
              checked={experience.includes(label)}
              id={`tour-experience-${label.replace(/\W+/g, '-').toLowerCase()}`}
              key={label}
              label={label}
              onChange={() =>
                update({
                  experience: toggleFilterValue(activeRef.current.experience, label)
                })
              }
            />
          ))}
        </ListingFilterDropdown>
      ) : null}

      {visibleTiers.length ? (
        <ListingFilterGroup title='Comfort tier'>
          {visibleTiers.map((tier) => (
            <ListingFilterOption
              checked={pricingTiers.includes(tier.value)}
              id={`tour-tier-${tier.value}`}
              key={tier.value}
              label={formatComfortTierLabel(tier.value, 'short')}
              onChange={() =>
                update({
                  pricingTiers: toggleFilterValue(
                    activeRef.current.pricingTiers,
                    tier.value
                  ) as PublicTourPricingTier['tier'][]
                })
              }
            />
          ))}
        </ListingFilterGroup>
      ) : null}

      <ListingFilterRange
        max={durationMax}
        min={durationMin}
        step={1}
        suffix='days'
        title='Duration'
        value={durationRange}
        onValueChange={setDurationRange}
        onCommit={(value) =>
          update({
            durationMin: value[0] <= durationMin ? undefined : String(value[0]),
            durationMax: value[1] >= durationMax ? undefined : String(value[1])
          })
        }
      />

      <ListingFilterRange
        max={priceMax}
        min={priceMin}
        step={50}
        suffix='USD'
        title='Price from'
        value={priceRange}
        onValueChange={setPriceRange}
        onCommit={(value) =>
          update({
            priceMin: value[0] <= priceMin ? undefined : String(value[0]),
            priceMax: value[1] >= priceMax ? undefined : String(value[1])
          })
        }
      />
    </ListingFilters>
  );
}
