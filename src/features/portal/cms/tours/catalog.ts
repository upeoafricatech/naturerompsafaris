import type { PricingTier } from './schema';
import { GROUP_JOINING_BAND, LEGACY_PAX_BANDS } from './legacy-pricing';

export const TOUR_CATALOG_GROUPS = [
  { id: 'kenya-lodges', label: 'Kenya lodges' },
  { id: 'kenya-tanzania-lodges', label: 'Kenya and Tanzania lodges' },
  { id: 'tanzania-lodges', label: 'Tanzania lodges' },
  { id: 'kenya-tanzania-group-joining', label: 'Kenya and Tanzania group joining' },
  { id: 'kenya-group-joining', label: 'Kenya group joining' },
  { id: 'coast-safaris', label: 'Coast safaris' },
  { id: 'mount-kenya', label: 'Mount Kenya' },
  { id: 'kilimanjaro', label: 'Kilimanjaro' }
] as const;

export type TourCatalogGroupId = (typeof TOUR_CATALOG_GROUPS)[number]['id'];

const CATALOG_IDS = new Set<string>(TOUR_CATALOG_GROUPS.map((group) => group.id));

export function isTourCatalogGroupId(value: string): value is TourCatalogGroupId {
  return CATALOG_IDS.has(value);
}

export function tourCatalogGroupLabel(id: string | null | undefined): string {
  return TOUR_CATALOG_GROUPS.find((group) => group.id === id)?.label ?? '';
}

const KENYA_LODGE_SEASONS = [
  'JAN-MAR',
  'APRIL-MAY',
  'JUNE',
  'JULY-OCT',
  'NOV-DEC',
  'DEC - 2ND JAN'
] as const;

const TANZANIA_LODGE_SEASONS = [
  'JAN-MAR',
  'APRIL-MAY',
  'JUNE-OCT',
  'NOV-15 DEC',
  'DEC - 2ND JAN'
] as const;

const GROUP_JOINING_SEASONS = ['Low Season (Jan - June)', 'High Season (July - Dec)'] as const;

const COAST_SEASONS = ['January-June', 'July-December'] as const;

const COAST_BANDS = ['1 PAX', '2-3 PAX', '2-4 PAX', '6 AND ABOVE'] as const;

const MOUNT_KENYA_SEASONS = [
  'JAN-MAR',
  'APRIL-JUNE',
  'JULY-OCT',
  'NOV-DEC',
  'DEC - 2ND JAN'
] as const;

const KILIMANJARO_SEASONS = ['JAN-MAY', 'JUNE-OCT'] as const;

export type PriceTablePreset = {
  id: string;
  groupId: TourCatalogGroupId;
  label: string;
  seasons: readonly string[];
  bands: readonly string[];
};

export const PRICE_TABLE_PRESETS: PriceTablePreset[] = [
  {
    id: 'kenya-lodge',
    groupId: 'kenya-lodges',
    label: 'Private groups',
    seasons: KENYA_LODGE_SEASONS,
    bands: LEGACY_PAX_BANDS
  },
  {
    id: 'kenya-tanzania-lodge',
    groupId: 'kenya-tanzania-lodges',
    label: 'Private groups',
    seasons: KENYA_LODGE_SEASONS,
    bands: LEGACY_PAX_BANDS
  },
  {
    id: 'tanzania-lodge',
    groupId: 'tanzania-lodges',
    label: 'Private groups',
    seasons: TANZANIA_LODGE_SEASONS,
    bands: LEGACY_PAX_BANDS
  },
  {
    id: 'kenya-tanzania-group-joining',
    groupId: 'kenya-tanzania-group-joining',
    label: 'Per person sharing',
    seasons: GROUP_JOINING_SEASONS,
    bands: [GROUP_JOINING_BAND]
  },
  {
    id: 'kenya-group-joining',
    groupId: 'kenya-group-joining',
    label: 'Per person, safari van',
    seasons: GROUP_JOINING_SEASONS,
    bands: ['Per person, safari van']
  },
  {
    id: 'coast-safari',
    groupId: 'coast-safaris',
    label: 'Private groups',
    seasons: COAST_SEASONS,
    bands: COAST_BANDS
  },
  {
    id: 'mount-kenya',
    groupId: 'mount-kenya',
    label: 'Private groups',
    seasons: MOUNT_KENYA_SEASONS,
    bands: LEGACY_PAX_BANDS
  },
  {
    id: 'kilimanjaro',
    groupId: 'kilimanjaro',
    label: 'Private groups',
    seasons: KILIMANJARO_SEASONS,
    bands: LEGACY_PAX_BANDS
  }
];

function sameColumns(tier: PricingTier, preset: PriceTablePreset): boolean {
  if (tier.seasons.length !== preset.seasons.length) return false;
  return tier.seasons.every((season, index) => {
    if (season.label.trim() !== preset.seasons[index]) return false;
    const bands = season.cells.map((cell) => cell.groupBand);
    return (
      bands.length === preset.bands.length &&
      bands.every((band, bandIndex) => band === preset.bands[bandIndex])
    );
  });
}

export function detectPriceTablePreset(tier: PricingTier, catalogGroup?: string): string {
  const matches = PRICE_TABLE_PRESETS.filter((preset) => sameColumns(tier, preset));
  if (!matches.length) return '';
  const preferred = matches.find((preset) => preset.groupId === catalogGroup);
  return (preferred ?? matches[0]).id;
}

/** Applies a collection's price grid. Keeps prices when the columns already match. */
export function applyPriceTablePreset(tier: PricingTier, presetId: string): PricingTier {
  const preset = PRICE_TABLE_PRESETS.find((item) => item.id === presetId);
  if (!preset || sameColumns(tier, preset)) return tier;

  return {
    ...tier,
    seasons: preset.seasons.map((label) => ({
      label,
      dateStart: '',
      dateEnd: '',
      cells: preset.bands.map((groupBand) => ({ groupBand, price: '' }))
    }))
  };
}
