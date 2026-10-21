import {
  formatExperienceKeyLabel,
  mapExperienceKeyToTourTier,
  type ExperiencePricingTableKey
} from '@/lib/pricing/experience-to-tour-pricing';
import type { PublicMountainRoutePricingRow } from '@/features/experiences/public/types';
import type { PublicTourPricingCell, PublicTourPricingTier } from '@/lib/public/types';

import type { PricingTier } from './schema';

export const LEGACY_PAX_BANDS = ['1 PAX', '2-3 PAX', '4-5 PAX', '6 AND ABOVE'] as const;

/** South Africa private tours: year-round matrix with three group-size columns. */
export const SOUTH_AFRICA_PAX_BANDS = ['1 PAX', '2 - 3 PAX', '4 PAX & ABOVE'] as const;

/** Excursions / day trips: one pax-rate row, no seasonal matrix. */
export const DAY_TRIP_SEASON_LABEL = 'Day trip';

/** Group joining departures: one shared rate, not a private group-size matrix. */
export const GROUP_JOINING_BAND = 'Per person sharing';

export const DEFAULT_GROUP_JOINING_SEASONS = [
  'Low Season (Jan - June)',
  'High Season (July - Dec)'
] as const;

export const MOUNTAIN_ACCOMMODATION_BANDS = ['Camping', 'Sleeping at hut'] as const;

export const DEFAULT_LEGACY_SEASONS = [
  '1st JAN - 31ST MARCH',
  '1st April - 31ST MAY',
  '1ST JUN - 30TH JUNE',
  '1ST JULY - 31ST AUG',
  '1ST SEPT - 31ST OCT',
  '1ST NOV - 22ND DEC',
  '23RD - 2ND JAN 2027'
] as const;

export const LEGACY_PRICING_TIER_OPTIONS: Array<{
  value: ExperiencePricingTableKey;
  label: string;
}> = [
  { value: 'economy', label: 'Economy' },
  { value: 'budget', label: 'Budget' },
  { value: 'mid_range', label: 'Mid-Range' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'high_end', label: 'High-End' },
  { value: 'custom', label: 'Custom' }
];

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function seasonCellBands(cells: Array<{ groupBand: string }>): string[] {
  return cells.map((cell) => cell.groupBand.trim()).filter(Boolean);
}

export function seasonUsesMountainBands(cells: Array<{ groupBand: string }>): boolean {
  const bands = seasonCellBands(cells);
  if (!bands.length) return false;
  const mountainSet = new Set<string>(MOUNTAIN_ACCOMMODATION_BANDS);
  return bands.every((band) => mountainSet.has(band));
}

export function seasonUsesSouthAfricaBands(cells: Array<{ groupBand: string }>): boolean {
  const bands = seasonCellBands(cells);
  if (!bands.length) return false;
  const saSet = new Set<string>(SOUTH_AFRICA_PAX_BANDS);
  return bands.every((band) => saSet.has(band));
}

export function isGroupJoiningBand(value: string): boolean {
  return value.trim().toLowerCase() === GROUP_JOINING_BAND.toLowerCase();
}

export function seasonUsesGroupJoiningBand(cells: Array<{ groupBand: string }>): boolean {
  const bands = seasonCellBands(cells);
  return bands.length > 0 && bands.every((band) => isGroupJoiningBand(band));
}

export function tierUsesGroupJoining(tier: PricingTier): boolean {
  return (
    tier.seasons.length > 0 &&
    tier.seasons.every((season) => seasonUsesGroupJoiningBand(season.cells))
  );
}

export function isDayTripSeasonLabel(label: string): boolean {
  return label.trim().toLowerCase() === DAY_TRIP_SEASON_LABEL.toLowerCase();
}

export function isDayTripPricingTierPublic(tier: PublicTourPricingTier): boolean {
  return tier.seasons.length === 1 && isDayTripSeasonLabel(tier.seasons[0]?.label ?? '');
}

export function isGroupJoiningPricingTierPublic(tier: PublicTourPricingTier): boolean {
  const seasons = tier.seasons.filter((season) => season.label.trim() || season.cells.length);
  if (!seasons.length) return false;
  return seasons.every((season) => seasonUsesGroupJoiningBand(season.cells));
}

export function createDayTripPricingSeason(): PricingTier['seasons'][number] {
  return {
    label: DAY_TRIP_SEASON_LABEL,
    dateStart: '',
    dateEnd: '',
    cells: LEGACY_PAX_BANDS.map((groupBand) => ({ groupBand, price: '' }))
  };
}

export function createDefaultDayTripPricingTier(
  tier: PricingTier['tier'] = 'mid_range'
): PricingTier {
  return {
    tier,
    label: 'Per person rates',
    blurb: '',
    notes: '',
    currency: 'USD',
    seasons: [createDayTripPricingSeason()]
  };
}

export function isMountainPricingTierPublic(tier: PublicTourPricingTier): boolean {
  const seasons = tier.seasons.filter((season) => season.label.trim());
  if (!seasons.length) return false;
  return seasons.every((season) => seasonUsesMountainBands(season.cells));
}

export function isMountainTourPricing(tiers: PublicTourPricingTier[]): boolean {
  return tiers.length > 0 && tiers.every(isMountainPricingTierPublic);
}

export function mountainPricingRowsFromTier(
  tier: PublicTourPricingTier
): PublicMountainRoutePricingRow[] {
  const season = tier.seasons.find((item) => item.label.trim()) ?? tier.seasons[0];
  if (!season) return [];

  return MOUNTAIN_ACCOMMODATION_BANDS.map((label) => {
    const cell = season.cells.find((item) => item.groupBand === label);
    const price = cell?.price;
    return {
      label,
      price: typeof price === 'number' && Number.isFinite(price) ? price : null
    };
  });
}

function mapBandPrices(
  cells: Array<{ groupBand: string; price?: number | null | string }>,
  bands: readonly string[]
): PublicTourPricingCell[] {
  const byBand = new Map(cells.map((cell) => [cell.groupBand, cell.price]));
  return bands.map((groupBand) => {
    const raw = byBand.get(groupBand);
    const price = typeof raw === 'string' ? toNumberOrNull(raw) : raw;
    return { groupBand, price: price ?? undefined };
  });
}

function groupJoiningPrice(
  cells: Array<{ groupBand: string; price?: number | null | string }>
): number | null | undefined {
  const match = cells.find((cell) => isGroupJoiningBand(cell.groupBand));
  if (!match) return undefined;
  return typeof match.price === 'string' ? toNumberOrNull(match.price) : match.price;
}

export function mapPublicSeasonCells(
  cells: Array<{ groupBand: string; price?: number | null | string }>
): PublicTourPricingCell[] {
  if (seasonUsesGroupJoiningBand(cells)) {
    return [{ groupBand: GROUP_JOINING_BAND, price: groupJoiningPrice(cells) ?? undefined }];
  }

  if (seasonUsesMountainBands(cells)) {
    return mapBandPrices(cells, MOUNTAIN_ACCOMMODATION_BANDS);
  }

  if (seasonUsesSouthAfricaBands(cells)) {
    return mapBandPrices(cells, SOUTH_AFRICA_PAX_BANDS);
  }

  const bands = seasonCellBands(cells);
  const legacySet = new Set<string>(LEGACY_PAX_BANDS);
  if (bands.length > 0 && bands.every((band) => legacySet.has(band))) {
    return mapBandPrices(cells, LEGACY_PAX_BANDS);
  }

  return cells.map((cell) => {
    const price = typeof cell.price === 'string' ? toNumberOrNull(cell.price) : cell.price;
    return { groupBand: cell.groupBand, price: price ?? undefined };
  });
}

export function normalizeLegacySeasonCells(
  cells: PricingTier['seasons'][number]['cells']
): PricingTier['seasons'][number]['cells'] {
  if (!cells.length) {
    return LEGACY_PAX_BANDS.map((groupBand) => ({ groupBand, price: '' }));
  }

  if (seasonUsesGroupJoiningBand(cells)) {
    const match = cells.find((cell) => isGroupJoiningBand(cell.groupBand));
    return [{ groupBand: GROUP_JOINING_BAND, price: match?.price ?? '' }];
  }

  if (seasonUsesMountainBands(cells)) {
    const byBand = new Map(cells.map((cell) => [cell.groupBand, cell.price]));
    return MOUNTAIN_ACCOMMODATION_BANDS.map((groupBand) => ({
      groupBand,
      price: byBand.get(groupBand) ?? ''
    }));
  }

  if (seasonUsesSouthAfricaBands(cells)) {
    const byBand = new Map(cells.map((cell) => [cell.groupBand, cell.price]));
    return SOUTH_AFRICA_PAX_BANDS.map((groupBand) => ({
      groupBand,
      price: byBand.get(groupBand) ?? ''
    }));
  }

  const bands = seasonCellBands(cells);
  const legacySet = new Set<string>(LEGACY_PAX_BANDS);
  // Only force the Kenya 4-column matrix when every band already belongs to it.
  // Preserve South Africa / custom layouts so a CMS save cannot invent "6 AND ABOVE".
  if (bands.every((band) => legacySet.has(band))) {
    const byBand = new Map(cells.map((cell) => [cell.groupBand, cell.price]));
    return LEGACY_PAX_BANDS.map((groupBand) => ({
      groupBand,
      price: byBand.get(groupBand) ?? ''
    }));
  }

  return cells.map((cell) => ({
    groupBand: cell.groupBand,
    price: cell.price ?? ''
  }));
}

/** Column headers for a season — follows stored bands (Kenya / SA / custom). */
export function paxBandsForSeason(cells: Array<{ groupBand: string }>): readonly string[] {
  if (seasonUsesGroupJoiningBand(cells)) return [GROUP_JOINING_BAND];
  if (seasonUsesMountainBands(cells)) return MOUNTAIN_ACCOMMODATION_BANDS;
  if (seasonUsesSouthAfricaBands(cells)) return SOUTH_AFRICA_PAX_BANDS;

  const bands = seasonCellBands(cells);
  if (!bands.length) return LEGACY_PAX_BANDS;

  const legacySet = new Set<string>(LEGACY_PAX_BANDS);
  if (bands.every((band) => legacySet.has(band))) return LEGACY_PAX_BANDS;

  return bands;
}

export function normalizeLegacyPricingTier(tier: PricingTier): PricingTier {
  return {
    ...tier,
    seasons: tier.seasons.map((season) => ({
      ...season,
      cells: normalizeLegacySeasonCells(season.cells)
    }))
  };
}

export function mapLegacyPricingTiersToPublic(
  tiers: PricingTier[],
  tourId = 'preview'
): PublicTourPricingTier[] {
  return tiers
    .filter((tier) => tier.seasons.some((season) => season.label.trim()))
    .map((tier, index) => ({
      id: `legacy-${tourId}-${tier.tier}-${index}`,
      tier: mapExperienceKeyToTourTier(tier.tier),
      label: tier.label.trim() || formatExperienceKeyLabel(tier.tier),
      blurb: tier.blurb.trim() || null,
      notes: tier.notes.trim() || null,
      currency: tier.currency || 'USD',
      seasons: tier.seasons
        .filter((season) => season.label.trim())
        .map((season, seasonIndex) => ({
          id: `legacy-${tourId}-${tier.tier}-season-${seasonIndex}`,
          label: season.label,
          dateStart: season.dateStart || null,
          dateEnd: season.dateEnd || null,
          cells: normalizeLegacySeasonCells(season.cells).map((cell) => {
            const price = toNumberOrNull(cell.price);
            return {
              groupBand: cell.groupBand,
              price: price ?? undefined
            };
          })
        }))
    }));
}

export function createGroupJoiningPricingSeason(label: string): PricingTier['seasons'][number] {
  return {
    label,
    dateStart: '',
    dateEnd: '',
    cells: [{ groupBand: GROUP_JOINING_BAND, price: '' }]
  };
}

export function createDefaultGroupJoiningPricingTier(
  tier: PricingTier['tier'] = 'budget'
): PricingTier {
  return {
    tier,
    label: '',
    blurb: 'Per person sharing on a group joining departure.',
    notes: '',
    currency: 'USD',
    seasons: DEFAULT_GROUP_JOINING_SEASONS.map((label) => createGroupJoiningPricingSeason(label))
  };
}

/** Shared departure: one price per person. Drops private group-size columns. */
export function withGroupJoiningLayout(tier: PricingTier): PricingTier {
  if (tierUsesGroupJoining(tier)) return normalizeLegacyPricingTier(tier);

  const hasPrices = tier.seasons.some((season) => season.cells.some((cell) => cell.price.trim()));

  if (!hasPrices) {
    return normalizeLegacyPricingTier({
      ...tier,
      blurb: tier.blurb.trim() || 'Per person sharing on a group joining departure.',
      seasons: DEFAULT_GROUP_JOINING_SEASONS.map((label) => createGroupJoiningPricingSeason(label))
    });
  }

  return normalizeLegacyPricingTier({
    ...tier,
    seasons: tier.seasons.map((season) => ({
      ...season,
      cells: [{ groupBand: GROUP_JOINING_BAND, price: '' }]
    }))
  });
}

/** Private departure: restore the Kenya group-size columns and clear shared rates. */
export function withPrivateGroupLayout(tier: PricingTier): PricingTier {
  if (!tierUsesGroupJoining(tier)) return normalizeLegacyPricingTier(tier);

  return normalizeLegacyPricingTier({
    ...tier,
    seasons: tier.seasons.map((season) => ({
      ...createLegacyPricingSeason(season.label),
      dateStart: season.dateStart,
      dateEnd: season.dateEnd
    }))
  });
}

export function createLegacyPricingSeason(label: string): PricingTier['seasons'][number] {
  return {
    label,
    dateStart: '',
    dateEnd: '',
    cells: LEGACY_PAX_BANDS.map((groupBand) => ({ groupBand, price: '' }))
  };
}

export function createSouthAfricaPricingSeason(
  label = '1st JAN - 31st DEC'
): PricingTier['seasons'][number] {
  return {
    label,
    dateStart: '',
    dateEnd: '',
    cells: SOUTH_AFRICA_PAX_BANDS.map((groupBand) => ({ groupBand, price: '' }))
  };
}

export function createDefaultSouthAfricaPricingTier(
  tier: PricingTier['tier'] = 'mid_range'
): PricingTier {
  return {
    tier,
    label: '',
    blurb: '',
    notes: '',
    currency: 'USD',
    seasons: [createSouthAfricaPricingSeason()]
  };
}

export function createDefaultLegacyPricingTier(
  tier: PricingTier['tier'] = 'mid_range'
): PricingTier {
  return {
    tier,
    label: '',
    blurb: '',
    notes: '',
    currency: 'USD',
    seasons: DEFAULT_LEGACY_SEASONS.map((label) => createLegacyPricingSeason(label))
  };
}

export function createMountainPricingSeason(): PricingTier['seasons'][number] {
  return {
    label: 'Per person',
    dateStart: '',
    dateEnd: '',
    cells: MOUNTAIN_ACCOMMODATION_BANDS.map((groupBand) => ({ groupBand, price: '' }))
  };
}

export function createDefaultMountainPricingTier(): PricingTier {
  return {
    tier: 'custom',
    label: 'Route pricing',
    blurb: 'Camping and hut prices for this climbing route.',
    notes: 'Solo travellers attract extra cost.',
    currency: 'USD',
    seasons: [createMountainPricingSeason()]
  };
}

export function normalizeMountainPricingTier(tier: PricingTier): PricingTier {
  const byBand = new Map(
    (tier.seasons[0]?.cells ?? []).map((cell) => [cell.groupBand, cell.price])
  );

  return {
    ...tier,
    tier: 'custom',
    label: tier.label.trim() || 'Route pricing',
    seasons: [
      {
        label: 'Per person',
        dateStart: '',
        dateEnd: '',
        cells: MOUNTAIN_ACCOMMODATION_BANDS.map((groupBand) => ({
          groupBand,
          price: byBand.get(groupBand) ?? ''
        }))
      }
    ]
  };
}
