'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { normalizeDirectAnswers } from '@/lib/seo/direct-answers';
import { autoTranslateTourById } from '@/lib/i18n/auto-translate-content';
import { scheduleAutoTranslate } from '@/lib/i18n/schedule-auto-translate';
import { notifyPublishedContent } from '@/lib/seo/publish-notify';
import {
  BRAND_OPERATING_COUNTRIES,
  type BrandCountryId
} from '@/features/experiences/public/country-map-copy';
import { parseTourSafariMarkets } from '@/features/experiences/public/tour-markets';
import { revalidateTourPublicPaths } from '@/features/portal/cms/tours/revalidate-public-paths';
import { findEnglishIdBySlug } from '@/features/portal/cms/shared/reuse-english-slug';
import {
  mapLegacyPricingTiersToPublic,
  normalizeLegacyPricingTier,
  normalizeLegacySeasonCells
} from '@/features/portal/cms/tours/legacy-pricing';
import {
  formatExperienceKeyLabel,
  levelHasFilledPrices,
  mapExperienceKeyToTourTier,
  mapExperienceLevelsToTourTiers,
  minPriceFromTourTiers,
  parseExperiencePackagePricing,
  parsePricingTableKeys,
  type ExperiencePricingTableKey
} from '@/lib/pricing/experience-to-tour-pricing';
import type { PublicTourPricingTier } from '@/lib/public/types';
import {
  tourFormSchema,
  tourDraftGateSchema,
  mergeTourDraftValues,
  normalizeItineraryDays,
  type PricingTier,
  type TourFormValues
} from './schema';

export type SaveStatus = 'draft' | 'published';

export type SaveTourResult = { ok: true; id: string } | { ok: false; error: string };

export interface TourRecord extends TourFormValues {
  id: string;
  status: string;
}

export interface RelationOption {
  value: string;
  label: string;
}

function parseExperienceCountries(value: unknown): BrandCountryId[] {
  if (!Array.isArray(value)) return [];

  const allowed = new Set(BRAND_OPERATING_COUNTRIES.map((country) => country.id));

  return value.filter(
    (item): item is BrandCountryId =>
      typeof item === 'string' && allowed.has(item as BrandCountryId)
  );
}

export type ExperiencePricingTableOption = {
  key: ExperiencePricingTableKey;
  label: string;
  blurb: string;
  currency: string;
  tourTier: PublicTourPricingTier['tier'];
  seasonCount: number;
  priceFrom: number | null;
};

export type TourPricingPreview = {
  hasPricing: boolean;
  priceFrom: number | null;
  source: 'experience' | 'legacy' | 'none';
  tierLabel: string | null;
  warning: string | null;
};

const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage tours.');
  }
  return session;
}

/** Tours gain a `gallery` column not yet in the generated types. */
async function genericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Rewrites a tour's links in one join table: clear then insert in order. */
async function replaceRelation(
  supabase: SupabaseClient,
  table: string,
  column: string,
  tourId: string,
  ids: string[]
) {
  await supabase.from(table).delete().eq('tour_id', tourId);
  if (!ids.length) return;
  const rows = ids.map((id, index) => ({ tour_id: tourId, [column]: id, position: index }));
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(error.message);
}

async function replacePricing(supabase: SupabaseClient, tourId: string, tiers: PricingTier[]) {
  await supabase.from('tour_pricing_tiers').delete().eq('tour_id', tourId);

  for (const [tierIndex, tier] of tiers.entries()) {
    const { data: tierRow, error: tierError } = await supabase
      .from('tour_pricing_tiers')
      .insert({
        tour_id: tourId,
        tier: tier.tier,
        label: tier.label || null,
        blurb: tier.blurb || null,
        notes: tier.notes || null,
        currency: tier.currency || 'USD',
        position: tierIndex
      })
      .select('id')
      .single();
    if (tierError) throw new Error(tierError.message);

    for (const [seasonIndex, season] of tier.seasons.entries()) {
      if (!season.label.trim()) continue;
      const { data: seasonRow, error: seasonError } = await supabase
        .from('tour_pricing_seasons')
        .insert({
          tier_id: tierRow.id,
          label: season.label,
          date_start: season.dateStart || null,
          date_end: season.dateEnd || null,
          position: seasonIndex
        })
        .select('id')
        .single();
      if (seasonError) throw new Error(seasonError.message);

      const cells = season.cells
        .map((cell, cellIndex) => ({
          season_id: seasonRow.id,
          group_band: cell.groupBand,
          band_position: cellIndex,
          price: toNumberOrNull(cell.price)
        }))
        .filter((cell) => cell.group_band.trim());

      if (cells.length) {
        const { error: cellsError } = await supabase.from('tour_pricing_cells').insert(cells);
        if (cellsError) throw new Error(cellsError.message);
      }
    }
  }
}

function mapTourDbError(message: string): string {
  if (message.includes('tour_translations_locale_slug_key')) {
    return 'This URL slug is already used by another tour. Choose a different slug.';
  }
  if (message.includes('og_image_id') && message.includes('foreign key')) {
    return 'A gallery image could not be linked. Re-select images in the Gallery step.';
  }
  if (message.includes('Could not find the') && message.includes('column')) {
    return 'The database is missing a required column. Contact support or redeploy the latest migrations.';
  }
  return message;
}

function saveValidationMessage(status: SaveStatus, detail?: string): string {
  if (detail) return detail;
  return status === 'published'
    ? 'Fix the highlighted fields before publishing.'
    : 'Add a title and slug to save a draft.';
}

async function resolveOgImageId(
  supabase: SupabaseClient,
  gallery: string[]
): Promise<string | null> {
  const candidate = gallery[0]?.trim();
  if (!candidate) return null;

  const { data } = await supabase
    .from('media_assets')
    .select('id')
    .eq('id', candidate)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export async function saveTour(input: {
  id?: string;
  values: TourFormValues;
  status: SaveStatus;
}): Promise<SaveTourResult> {
  try {
    await assertCanWrite();

    let values: TourFormValues;

    if (input.status === 'published') {
      const parsed = tourFormSchema.safeParse(input.values);
      if (!parsed.success) {
        return {
          ok: false,
          error: saveValidationMessage(input.status, parsed.error.issues[0]?.message)
        };
      }
      values = parsed.data;
    } else {
      const gate = tourDraftGateSchema.safeParse(input.values);
      if (!gate.success) {
        return {
          ok: false,
          error: saveValidationMessage(input.status, gate.error.issues[0]?.message)
        };
      }
      values = mergeTourDraftValues(input.values);
    }

    const supabase = await genericClient();
    const now = new Date().toISOString();
    let tourId =
      input.id ??
      (await findEnglishIdBySlug(supabase, 'tour_translations', 'tour_id', values.slug));
    const isNew = !tourId;

    const usesExperiencePricing =
      values.pricingExperienceId.trim().length > 0 && values.pricingTableKeys.length > 0;

    const basePayload = {
      days: toNumberOrNull(values.days),
      nights: toNumberOrNull(values.nights),
      price_from: toNumberOrNull(values.priceFrom),
      start_location: values.startLocation || null,
      end_location: values.endLocation || null,
      important_notice: values.importantNotice || null,
      itinerary_days: values.itineraryDays,
      route_waypoints: values.routeLegs,
      inclusions: values.inclusions,
      exclusions: values.exclusions,
      gallery: values.gallery,
      catalog_group: values.catalogGroup || null,
      countries: values.countries,
      pricing_experience_id: usesExperiencePricing ? values.pricingExperienceId : null,
      pricing_table_keys: usesExperiencePricing ? values.pricingTableKeys : [],
      status: input.status,
      updated_at: now
    };

    if (tourId) {
      const { error } = await supabase.from('tours').update(basePayload).eq('id', tourId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase
        .from('tours')
        .insert(basePayload)
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      tourId = data.id as string;
    }

    const { data: existing } = await supabase
      .from('tour_translations')
      .select('id, published_at')
      .eq('tour_id', tourId)
      .eq('locale', 'en')
      .maybeSingle();

    const publishedAt = input.status === 'published' ? (existing?.published_at ?? now) : null;
    const ogImageId = await resolveOgImageId(supabase, values.gallery);

    const translationPayload = {
      tour_id: tourId,
      locale: 'en',
      slug: values.slug,
      title: values.title,
      excerpt: values.excerpt || null,
      overview: values.overview ? { html: values.overview } : null,
      og_image_id: ogImageId,
      faqs: normalizeDirectAnswers(values.faqs),
      seo_title: values.seoTitle || values.title,
      seo_description: values.seoDescription || null,
      focus_keyword: values.focusKeyword || null,
      keywords: values.keywords,
      published_at: publishedAt,
      updated_at: now
    };

    if (existing) {
      const { error } = await supabase
        .from('tour_translations')
        .update(translationPayload)
        .eq('id', existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('tour_translations').insert(translationPayload);
      if (error) {
        if (isNew) await supabase.from('tours').delete().eq('id', tourId);
        throw new Error(error.message);
      }
    }

    await replaceRelation(supabase, 'tour_national_parks', 'park_id', tourId, values.parkIds);
    await replaceRelation(
      supabase,
      'tour_destinations',
      'destination_id',
      tourId,
      values.destinationIds
    );
    const experienceIds = [
      ...new Set([
        ...values.experienceIds,
        ...(usesExperiencePricing && values.pricingExperienceId ? [values.pricingExperienceId] : [])
      ])
    ];
    await replaceRelation(supabase, 'tour_experiences', 'experience_id', tourId, experienceIds);
    await replaceRelation(
      supabase,
      'tour_accommodations',
      'accommodation_id',
      tourId,
      values.accommodationIds
    );
    await replaceRelation(supabase, 'tour_fleet', 'vehicle_id', tourId, values.fleetIds);

    if (usesExperiencePricing) {
      await supabase.from('tour_pricing_tiers').delete().eq('tour_id', tourId);
    } else {
      await replacePricing(supabase, tourId, values.pricingTiers);
    }

    revalidatePath('/portal/tours');
    revalidateTourPublicPaths();
    if (input.status === 'published') {
      notifyPublishedContent({ pathPrefix: 'tours', slug: values.slug });
      scheduleAutoTranslate(() => autoTranslateTourById(tourId));
    }
    return { ok: true, id: tourId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save tour.';
    return { ok: false, error: mapTourDbError(message) };
  }
}

async function pricingTiers(supabase: SupabaseClient, tourId: string): Promise<PricingTier[]> {
  const { data: tiers } = await supabase
    .from('tour_pricing_tiers')
    .select('id, tier, label, blurb, notes, currency, position')
    .eq('tour_id', tourId)
    .order('position', { ascending: true });

  const tierRows = tiers ?? [];
  if (!tierRows.length) return [];

  const tierIds = tierRows.map((tier) => tier.id as string);
  const { data: seasons } = await supabase
    .from('tour_pricing_seasons')
    .select('id, tier_id, label, date_start, date_end, position')
    .in('tier_id', tierIds)
    .order('position', { ascending: true });

  const seasonRows = seasons ?? [];
  const seasonIds = seasonRows.map((season) => season.id as string);
  const { data: cells } = seasonIds.length
    ? await supabase
        .from('tour_pricing_cells')
        .select('season_id, group_band, band_position, price')
        .in('season_id', seasonIds)
        .order('band_position', { ascending: true })
    : { data: [] };

  const cellsBySeason = new Map<string, PricingTier['seasons'][number]['cells']>();
  for (const cell of cells ?? []) {
    const seasonId = cell.season_id as string;
    cellsBySeason.set(seasonId, [
      ...(cellsBySeason.get(seasonId) ?? []),
      {
        groupBand: cell.group_band as string,
        price: cell.price != null ? String(cell.price) : ''
      }
    ]);
  }

  const seasonsByTier = new Map<string, PricingTier['seasons']>();
  for (const season of seasonRows) {
    const tierId = season.tier_id as string;
    seasonsByTier.set(tierId, [
      ...(seasonsByTier.get(tierId) ?? []),
      {
        label: (season.label as string) ?? '',
        dateStart: (season.date_start as string | null) ?? '',
        dateEnd: (season.date_end as string | null) ?? '',
        cells: normalizeLegacySeasonCells(cellsBySeason.get(season.id as string) ?? [])
      }
    ]);
  }

  return tierRows.map((tier) =>
    normalizeLegacyPricingTier({
      tier: tier.tier as PricingTier['tier'],
      label: (tier.label as string | null) ?? '',
      blurb: (tier.blurb as string | null) ?? '',
      notes: (tier.notes as string | null) ?? '',
      currency: (tier.currency as string | null) ?? 'USD',
      seasons: seasonsByTier.get(tier.id as string) ?? []
    })
  );
}

async function relationIds(
  supabase: SupabaseClient,
  table: string,
  column: string,
  tourId: string
): Promise<string[]> {
  const { data } = await supabase
    .from(table)
    .select(`${column}, position`)
    .eq('tour_id', tourId)
    .order('position', { ascending: true });
  return (data ?? []).map((row) => row[column as keyof typeof row] as string);
}

export async function getTour(id: string): Promise<TourRecord | null> {
  const supabase = await genericClient();

  const { data: base } = await supabase.from('tours').select('*').eq('id', id).maybeSingle();
  if (!base) return null;

  const { data: translation } = await supabase
    .from('tour_translations')
    .select('*')
    .eq('tour_id', id)
    .eq('locale', 'en')
    .maybeSingle();

  const overview = (translation?.overview as { html?: string; text?: string } | null) ?? null;
  const keywords = Array.isArray(translation?.keywords) ? (translation.keywords as string[]) : [];

  const [parkIds, destinationIds, experienceIds, accommodationIds, fleetIds, pricing] =
    await Promise.all([
      relationIds(supabase, 'tour_national_parks', 'park_id', id),
      relationIds(supabase, 'tour_destinations', 'destination_id', id),
      relationIds(supabase, 'tour_experiences', 'experience_id', id),
      relationIds(supabase, 'tour_accommodations', 'accommodation_id', id),
      relationIds(supabase, 'tour_fleet', 'vehicle_id', id),
      pricingTiers(supabase, id)
    ]);

  return {
    id: base.id as string,
    status: base.status as string,
    days: base.days != null ? String(base.days) : '',
    nights: base.nights != null ? String(base.nights) : '',
    priceFrom: base.price_from != null ? String(base.price_from) : '',
    startLocation: base.start_location ?? '',
    endLocation: base.end_location ?? '',
    routeLegs: Array.isArray(base.route_waypoints) ? base.route_waypoints : [],
    importantNotice: base.important_notice ?? '',
    itineraryDays: normalizeItineraryDays(base.itinerary_days),
    inclusions: Array.isArray(base.inclusions) ? (base.inclusions as string[]) : [],
    exclusions: Array.isArray(base.exclusions) ? (base.exclusions as string[]) : [],
    pricingTiers: pricing,
    pricingExperienceId: (base.pricing_experience_id as string | null) ?? '',
    pricingTableKeys: parsePricingTableKeys(base.pricing_table_keys),
    catalogGroup: typeof base.catalog_group === 'string' ? base.catalog_group : '',
    countries: parseTourSafariMarkets(base.countries),
    gallery: Array.isArray(base.gallery) ? (base.gallery as string[]) : [],
    parkIds,
    destinationIds,
    experienceIds,
    accommodationIds,
    fleetIds,
    title: translation?.title ?? '',
    slug: translation?.slug ?? '',
    excerpt: translation?.excerpt ?? '',
    overview: overview?.html ?? overview?.text ?? '',
    faqs: normalizeDirectAnswers(translation?.faqs),
    seoTitle: translation?.seo_title ?? '',
    seoDescription: translation?.seo_description ?? '',
    focusKeyword: translation?.focus_keyword ?? '',
    keywords
  };
}

/** id + en title/name options for a content module's relation multi-select. */
async function moduleOptions(
  supabase: SupabaseClient,
  translationTable: string,
  foreignKey: string,
  titleField: string
): Promise<RelationOption[]> {
  const { data } = await supabase
    .from(translationTable)
    .select(`${foreignKey}, ${titleField}`)
    .eq('locale', 'en')
    .order(titleField, { ascending: true });

  return (data ?? []).map((row) => ({
    value: row[foreignKey as keyof typeof row] as string,
    label: (row[titleField as keyof typeof row] as string) ?? 'Untitled'
  }));
}

/** All relation option lists the Tour wizard needs, fetched together. */
export async function getTourRelationOptions(): Promise<{
  parks: RelationOption[];
  destinations: RelationOption[];
  experiences: RelationOption[];
  accommodations: RelationOption[];
  fleet: RelationOption[];
  experienceCountries: Record<string, BrandCountryId[]>;
  experienceLayoutVariants: Record<string, 'safari' | 'mountain'>;
}> {
  const supabase = await genericClient();
  const [parks, destinations, experiences, accommodations, fleet, experienceRows] =
    await Promise.all([
      moduleOptions(supabase, 'national_park_translations', 'park_id', 'name'),
      moduleOptions(supabase, 'destination_translations', 'destination_id', 'name'),
      moduleOptions(supabase, 'experience_translations', 'experience_id', 'title'),
      moduleOptions(supabase, 'accommodation_translations', 'accommodation_id', 'name'),
      moduleOptions(supabase, 'fleet_vehicle_translations', 'vehicle_id', 'title'),
      supabase.from('experiences').select('id, countries, layout_variant').is('deleted_at', null)
    ]);

  const experienceCountries = Object.fromEntries(
    (experienceRows.data ?? []).map((row) => [
      row.id as string,
      parseExperienceCountries(row.countries)
    ])
  );
  const experienceLayoutVariants = Object.fromEntries(
    (experienceRows.data ?? []).map((row) => [
      row.id as string,
      row.layout_variant === 'mountain' ? ('mountain' as const) : ('safari' as const)
    ])
  ) as Record<string, 'safari' | 'mountain'>;

  return {
    parks,
    destinations,
    experiences,
    accommodations,
    fleet,
    experienceCountries,
    experienceLayoutVariants
  };
}

export async function getExperiencePricingTablesForWizard(
  experienceId: string
): Promise<ExperiencePricingTableOption[]> {
  await requirePortalSession();
  if (!experienceId) return [];

  const supabase = await genericClient();
  const { data, error } = await supabase
    .from('experiences')
    .select('package_pricing')
    .eq('id', experienceId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return parseExperiencePackagePricing(data?.package_pricing)
    .filter(levelHasFilledPrices)
    .map((level) => ({
      key: level.key,
      label: level.label || formatExperienceKeyLabel(level.key),
      blurb: level.blurb,
      currency: level.currency,
      tourTier: mapExperienceKeyToTourTier(level.key),
      seasonCount: level.seasons.length,
      priceFrom: minPriceFromTourTiers(
        mapExperienceLevelsToTourTiers([level], [level.key], experienceId)
      )
    }));
}

export async function getExperiencePricingPreview(
  experienceId: string,
  keys: ExperiencePricingTableKey[]
): Promise<PublicTourPricingTier[]> {
  await requirePortalSession();
  if (!experienceId || !keys.length) return [];

  const supabase = await genericClient();
  const { data, error } = await supabase
    .from('experiences')
    .select('package_pricing')
    .eq('id', experienceId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const levels = parseExperiencePackagePricing(data?.package_pricing);
  return mapExperienceLevelsToTourTiers(levels, keys, experienceId);
}

async function resolveTourPricingForPreview(
  supabase: SupabaseClient,
  tourId: string
): Promise<PublicTourPricingTier[]> {
  const { data: tour } = await supabase
    .from('tours')
    .select('pricing_experience_id, pricing_table_keys')
    .eq('id', tourId)
    .maybeSingle();

  if (!tour) return [];

  const experienceId = tour.pricing_experience_id as string | null;
  const keys = parsePricingTableKeys(tour.pricing_table_keys);

  if (experienceId && keys.length) {
    const { data: experience } = await supabase
      .from('experiences')
      .select('package_pricing')
      .eq('id', experienceId)
      .maybeSingle();

    const levels = parseExperiencePackagePricing(experience?.package_pricing);
    return mapExperienceLevelsToTourTiers(levels, keys, experienceId);
  }

  return legacyPricingTiersToPublic(await pricingTiers(supabase, tourId), tourId);
}

function legacyPricingTiersToPublic(tiers: PricingTier[], tourId: string): PublicTourPricingTier[] {
  return mapLegacyPricingTiersToPublic(tiers, tourId);
}

export async function previewTourPricingForPackage(input: {
  tourId: string;
  comfortTier: PublicTourPricingTier['tier'];
}): Promise<TourPricingPreview> {
  await requirePortalSession();
  if (!input.tourId) {
    return {
      hasPricing: false,
      priceFrom: null,
      source: 'none',
      tierLabel: null,
      warning: 'Select a source trip route first.'
    };
  }

  const supabase = await genericClient();
  const { data: tour } = await supabase
    .from('tours')
    .select('pricing_experience_id, pricing_table_keys, price_from')
    .eq('id', input.tourId)
    .maybeSingle();

  if (!tour) {
    return {
      hasPricing: false,
      priceFrom: null,
      source: 'none',
      tierLabel: null,
      warning: 'Trip route not found.'
    };
  }

  const tiers = await resolveTourPricingForPreview(supabase, input.tourId);
  const matchedTier = tiers.find((tier) => tier.tier === input.comfortTier) ?? null;
  const source =
    tour.pricing_experience_id && parsePricingTableKeys(tour.pricing_table_keys).length
      ? 'experience'
      : tiers.length
        ? 'legacy'
        : 'none';

  if (!matchedTier) {
    return {
      hasPricing: false,
      priceFrom: tour.price_from != null ? Number(tour.price_from) : null,
      source,
      tierLabel: null,
      warning: `No ${input.comfortTier.replace('_', ' ')} pricing table linked to this trip.`
    };
  }

  return {
    hasPricing: true,
    priceFrom: minPriceFromTourTiers([matchedTier]),
    source,
    tierLabel: matchedTier.label,
    warning: null
  };
}

export async function deleteTour(id: string): Promise<void> {
  await assertCanWrite();
  const supabase = await genericClient();

  await supabase.from('tour_translations').delete().eq('tour_id', id);
  const { error } = await supabase.from('tours').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/tours');
  revalidateTourPublicPaths();
}
