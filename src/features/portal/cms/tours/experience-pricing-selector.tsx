'use client';

import * as React from 'react';

import { useQuery } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { TourPricingTable } from '@/components/public/tours/tour-pricing-table';
import {
  mapExperienceKeyToTourTier,
  minPriceFromTourTiers,
  type ExperiencePricingTableKey
} from '@/lib/pricing/experience-to-tour-pricing';
import { cn } from '@/lib/utils';
import { Combobox } from '../shared/combobox';
import type { PricingTier } from './schema';
import {
  createDefaultLegacyPricingTier,
  createDefaultMountainPricingTier,
  createGroupJoiningPricingSeason,
  createLegacyPricingSeason,
  createMountainPricingSeason,
  createSouthAfricaPricingSeason,
  LEGACY_PRICING_TIER_OPTIONS,
  mapLegacyPricingTiersToPublic,
  normalizeMountainPricingTier,
  paxBandsForSeason,
  seasonUsesGroupJoiningBand,
  seasonUsesSouthAfricaBands,
  tierUsesGroupJoining
} from './legacy-pricing';
import {
  applyPriceTablePreset,
  detectPriceTablePreset,
  PRICE_TABLE_PRESETS,
  TOUR_CATALOG_GROUPS,
  tourCatalogGroupLabel
} from './catalog';
import {
  getExperiencePricingPreview,
  getExperiencePricingTablesForWizard,
  type RelationOption
} from './service';

type ExperiencePricingSelectorProps = {
  catalogGroup?: string;
  experienceIds: string[];
  experienceOptions: RelationOption[];
  priceFrom: string;
  pricingExperienceId: string;
  pricingMode?: 'safari' | 'mountain';
  pricingTableKeys: ExperiencePricingTableKey[];
  pricingTiers: PricingTier[];
  onPricingExperienceIdChange: (value: string) => void;
  onPricingTableKeysChange: (value: ExperiencePricingTableKey[]) => void;
  onPricingTiersChange: (value: PricingTier[]) => void;
  onPriceFromChange: (value: string) => void;
};

async function fetchPreviewTiers(experienceId: string, keys: ExperiencePricingTableKey[]) {
  return getExperiencePricingPreview(experienceId, keys);
}

function tierBadgeVariant(tier: ReturnType<typeof mapExperienceKeyToTourTier>) {
  if (tier === 'budget') return 'secondary';
  if (tier === 'luxury') return 'default';
  return 'outline';
}

export function ExperiencePricingSelector({
  catalogGroup = '',
  experienceIds,
  experienceOptions,
  priceFrom,
  pricingExperienceId,
  pricingMode = 'safari',
  pricingTableKeys,
  pricingTiers,
  onPricingExperienceIdChange,
  onPricingTableKeysChange,
  onPricingTiersChange,
  onPriceFromChange
}: ExperiencePricingSelectorProps) {
  const isMountainPricing = pricingMode === 'mountain';
  const [showLegacy, setShowLegacy] = React.useState(
    isMountainPricing || (!pricingExperienceId && pricingTiers.length > 0)
  );

  const linkedExperienceOptions = experienceOptions.filter((option) =>
    experienceIds.includes(option.value)
  );

  const autoSelectedExperienceRef = React.useRef(false);
  const onPricingExperienceIdChangeRef = React.useRef(onPricingExperienceIdChange);
  const onPriceFromChangeRef = React.useRef(onPriceFromChange);

  onPricingExperienceIdChangeRef.current = onPricingExperienceIdChange;
  onPriceFromChangeRef.current = onPriceFromChange;

  React.useEffect(() => {
    if (pricingExperienceId || linkedExperienceOptions.length !== 1) return;
    if (autoSelectedExperienceRef.current) return;
    autoSelectedExperienceRef.current = true;
    onPricingExperienceIdChangeRef.current(linkedExperienceOptions[0].value);
  }, [linkedExperienceOptions, pricingExperienceId]);

  const { data: tableOptions = [], isLoading } = useQuery({
    queryKey: ['experience-pricing-tables', pricingExperienceId],
    queryFn: () => getExperiencePricingTablesForWizard(pricingExperienceId),
    enabled: Boolean(pricingExperienceId)
  });

  const { data: previewTiers = [] } = useQuery({
    queryKey: ['experience-pricing-preview', pricingExperienceId, pricingTableKeys],
    queryFn: () => fetchPreviewTiers(pricingExperienceId, pricingTableKeys),
    enabled: Boolean(pricingExperienceId) && pricingTableKeys.length > 0
  });

  React.useEffect(() => {
    const minPrice = minPriceFromTourTiers(previewTiers);
    if (minPrice == null || !pricingTableKeys.length) return;

    const nextPrice = String(minPrice);
    if (nextPrice === priceFrom) return;

    onPriceFromChangeRef.current(nextPrice);
  }, [previewTiers, priceFrom, pricingTableKeys.length]);

  function toggleTableKey(key: ExperiencePricingTableKey, checked: boolean) {
    if (checked) {
      if (pricingTableKeys.length >= 3) return;
      const tourTier = mapExperienceKeyToTourTier(key);
      const conflicting = pricingTableKeys.some(
        (selectedKey) => mapExperienceKeyToTourTier(selectedKey) === tourTier
      );
      if (conflicting) return;
      onPricingTableKeysChange([...pricingTableKeys, key]);
      onPricingTiersChange([]);
      setShowLegacy(false);
      return;
    }

    onPricingTableKeysChange(pricingTableKeys.filter((item) => item !== key));
  }

  React.useEffect(() => {
    if (!isMountainPricing) return;
    if (pricingExperienceId) onPricingExperienceIdChange('');
    if (pricingTableKeys.length) onPricingTableKeysChange([]);
    if (!pricingTiers.length) onPricingTiersChange([createDefaultMountainPricingTier()]);
    setShowLegacy(true);
  }, [
    isMountainPricing,
    onPricingExperienceIdChange,
    onPricingTableKeysChange,
    onPricingTiersChange,
    pricingExperienceId,
    pricingTableKeys.length,
    pricingTiers.length
  ]);

  if (!experienceIds.length) {
    return (
      <div className='rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
        Link at least one experience on the Links step. Pricing tables come from that experience and
        update automatically when you edit the experience.
      </div>
    );
  }

  if (isMountainPricing) {
    const mountainTiers = pricingTiers.length
      ? pricingTiers.map(normalizeMountainPricingTier)
      : [createDefaultMountainPricingTier()];

    return (
      <div className='grid gap-5'>
        <div className='rounded-lg border bg-muted/25 p-4'>
          <h3 className='text-sm font-semibold'>Mountain route pricing</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Enter camping and hut prices per person for this route. These appear on the tour detail
            page when the route is opened.
          </p>
        </div>
        <MountainPricingInput
          value={mountainTiers}
          onChange={(next) => onPricingTiersChange(next.map(normalizeMountainPricingTier))}
        />
      </div>
    );
  }

  return (
    <div className='grid gap-5'>
      <div className='grid gap-2'>
        <Label htmlFor='pricing-experience'>Pricing experience</Label>
        <Combobox
          id='pricing-experience'
          options={linkedExperienceOptions}
          value={pricingExperienceId}
          onChange={(next) => {
            onPricingExperienceIdChange(next);
            onPricingTableKeysChange([]);
          }}
          placeholder='Select experience'
          searchPlaceholder='Search linked experiences…'
        />
      </div>

      {pricingExperienceId ? (
        <div className='grid gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <Label>Package pricing tables</Label>
            <span className='text-muted-foreground text-xs'>Select up to 3</span>
          </div>

          {isLoading ? (
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <Icons.spinner className='size-4 animate-spin' />
              Loading tables…
            </div>
          ) : null}

          {!isLoading && !tableOptions.length ? (
            <div className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>
              No filled pricing tables on this experience yet. Add them in the Experience wizard
              under Package Tables.
            </div>
          ) : null}

          <div className='grid gap-2'>
            {tableOptions.map((table) => {
              const checked = pricingTableKeys.includes(table.key);
              const tourTier = mapExperienceKeyToTourTier(table.key);
              const tierTaken =
                !checked &&
                pricingTableKeys.some(
                  (selectedKey) => mapExperienceKeyToTourTier(selectedKey) === tourTier
                );
              const maxReached = !checked && pricingTableKeys.length >= 3;

              return (
                <label
                  key={table.key}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    checked && 'border-primary bg-primary/5',
                    (tierTaken || maxReached) && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={tierTaken || maxReached}
                    onCheckedChange={(value) => toggleTableKey(table.key, value === true)}
                  />
                  <div className='grid flex-1 gap-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-sm font-medium'>{table.label}</span>
                      <Badge variant={tierBadgeVariant(table.tourTier)}>{table.key}</Badge>
                    </div>
                    {table.blurb ? (
                      <p className='text-muted-foreground text-xs'>{table.blurb}</p>
                    ) : null}
                    <p className='text-muted-foreground text-xs'>
                      {table.seasonCount} season(s)
                      {table.priceFrom != null ? ` · from $${table.priceFrom}` : ''}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {previewTiers.length ? (
        <div className='grid gap-2'>
          <Label>Preview</Label>
          <TourPricingTable tiers={previewTiers} />
        </div>
      ) : null}

      <div className='border-t pt-4'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => {
            setShowLegacy((current) => !current);
            if (!showLegacy) {
              onPricingExperienceIdChange('');
              onPricingTableKeysChange([]);
              if (!pricingTiers.length) {
                onPricingTiersChange([createDefaultLegacyPricingTier()]);
              }
            }
          }}
        >
          {showLegacy ? 'Hide legacy manual pricing' : 'Use legacy manual pricing instead'}
        </Button>
      </div>

      {showLegacy ? (
        <>
          <LegacyPricingInput
            catalogGroup={catalogGroup}
            value={pricingTiers}
            onChange={onPricingTiersChange}
          />
          {pricingTiers.length ? (
            <div className='grid gap-2'>
              <Label>Legacy preview</Label>
              <TourPricingTable tiers={mapLegacyPricingTiersToPublic(pricingTiers)} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const PRICING_TIER_OPTIONS = LEGACY_PRICING_TIER_OPTIONS;

function LegacyPricingInput({
  catalogGroup = '',
  value,
  onChange
}: {
  catalogGroup?: string;
  value: PricingTier[];
  onChange: (next: PricingTier[]) => void;
}) {
  const tiers = value.length ? value : [createDefaultLegacyPricingTier()];

  const usedTierKeys = new Set(tiers.map((tier) => tier.tier));

  function updateTier(index: number, patch: Partial<PricingTier>) {
    onChange(tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  function removeTier(index: number) {
    onChange(tiers.filter((_, i) => i !== index));
  }

  function updateSeasonLabel(tierIndex: number, seasonIndex: number, label: string) {
    updateTier(tierIndex, {
      seasons: tiers[tierIndex].seasons.map((season, i) =>
        i === seasonIndex ? { ...season, label } : season
      )
    });
  }

  function updatePrice(tierIndex: number, seasonIndex: number, cellIndex: number, price: string) {
    updateTier(tierIndex, {
      seasons: tiers[tierIndex].seasons.map((season, i) =>
        i === seasonIndex
          ? {
              ...season,
              cells: season.cells.map((cell, nextCellIndex) =>
                nextCellIndex === cellIndex ? { ...cell, price } : cell
              )
            }
          : season
      )
    });
  }

  function addSeason(tierIndex: number) {
    const existing = tiers[tierIndex].seasons[0];
    const nextSeason = existing
      ? seasonUsesGroupJoiningBand(existing.cells)
        ? createGroupJoiningPricingSeason('')
        : seasonUsesSouthAfricaBands(existing.cells)
          ? createSouthAfricaPricingSeason('')
          : {
              label: '',
              dateStart: '',
              dateEnd: '',
              cells: existing.cells.map((cell) => ({ groupBand: cell.groupBand, price: '' }))
            }
      : createLegacyPricingSeason('');

    updateTier(tierIndex, {
      seasons: [...tiers[tierIndex].seasons, nextSeason]
    });
  }

  return (
    <div className='grid gap-4'>
      <div className='rounded-lg border bg-muted/25 p-4'>
        <h3 className='text-sm font-semibold'>Trip pricing table</h3>
        <p className='mt-1 text-sm text-muted-foreground'>
          {catalogGroup
            ? `This safari is filed under ${tourCatalogGroupLabel(catalogGroup)}. `
            : ''}
          Choose the matching price table below. Changing the table replaces the season rows and
          clears prices that do not fit the new columns. Empty prices show as &ldquo;On
          request&rdquo; on the public page.
        </p>
      </div>

      {tiers.map((tier, tierIndex) => {
        const groupJoining = tierUsesGroupJoining(tier);
        const bandHeaders = paxBandsForSeason(tier.seasons[0]?.cells ?? []);
        const tableMinWidth = groupJoining
          ? 'min-w-[520px]'
          : bandHeaders.length <= 3
            ? 'min-w-[640px]'
            : 'min-w-[860px]';

        return (
          <div
            className='overflow-hidden rounded-lg border border-[#3C5142]/30 bg-background shadow-sm'
            key={`${tier.tier}-${tierIndex}`}
          >
            <div className='mb-0 flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 p-4'>
              <div className='grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]'>
                <select
                  className='border-input bg-background rounded-md border px-3 py-2 text-sm'
                  onChange={(event) =>
                    updateTier(tierIndex, { tier: event.target.value as PricingTier['tier'] })
                  }
                  value={tier.tier}
                >
                  {PRICING_TIER_OPTIONS.map((option) => {
                    const taken = usedTierKeys.has(option.value) && tier.tier !== option.value;
                    return (
                      <option disabled={taken} key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    );
                  })}
                </select>
                <Input
                  value={tier.label}
                  onChange={(event) => updateTier(tierIndex, { label: event.target.value })}
                  placeholder='Tier heading'
                />
              </div>
              <Button type='button' size='sm' variant='ghost' onClick={() => removeTier(tierIndex)}>
                <Icons.trash className='size-4' />
              </Button>
            </div>

            <div className='grid gap-4 p-4'>
              <div className='grid gap-1.5'>
                <Label htmlFor={`price-table-${tierIndex}`}>Price table</Label>
                <select
                  id={`price-table-${tierIndex}`}
                  className='border-input bg-background h-9 rounded-md border px-3 text-sm'
                  value={detectPriceTablePreset(tier, catalogGroup)}
                  onChange={(event) => {
                    const presetId = event.target.value;
                    if (!presetId) return;
                    updateTier(tierIndex, applyPriceTablePreset(tier, presetId));
                  }}
                >
                  <option value=''>
                    {detectPriceTablePreset(tier, catalogGroup)
                      ? 'Choose a price table'
                      : 'Keep current columns'}
                  </option>
                  {TOUR_CATALOG_GROUPS.map((group) => {
                    const presets = PRICE_TABLE_PRESETS.filter(
                      (preset) => preset.groupId === group.id
                    );
                    if (!presets.length) return null;
                    return (
                      <optgroup key={group.id} label={group.label}>
                        {presets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.label}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
              <Textarea
                value={tier.blurb}
                onChange={(event) => updateTier(tierIndex, { blurb: event.target.value })}
                placeholder={
                  groupJoining
                    ? 'Short note, such as per person sharing on a group departure…'
                    : 'Short tier description…'
                }
                rows={2}
              />

              <div className='overflow-x-auto rounded-md border border-[#3C5142]/20'>
                <table className={cn('w-full text-sm', tableMinWidth)}>
                  <thead>
                    <tr className='border-b border-[#C8A84E] bg-[#3C5142] text-left text-xs font-semibold uppercase tracking-wide text-white'>
                      <th className='w-52 px-3 py-3'>Season</th>
                      {bandHeaders.map((band) => (
                        <th className='px-3 py-3' key={band}>
                          <span className='block'>{band}</span>
                          <span className='mt-1 block text-[10px] font-normal normal-case tracking-normal opacity-80'>
                            per person
                          </span>
                        </th>
                      ))}
                      <th className='px-3 py-3 text-center'>Enquiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tier.seasons.map((season, seasonIndex) => (
                      <tr className='border-b last:border-b-0 even:bg-muted/20' key={seasonIndex}>
                        <th className='px-3 py-3 align-top'>
                          <Input
                            aria-label={`Season ${seasonIndex + 1}`}
                            value={season.label}
                            onChange={(event) =>
                              updateSeasonLabel(tierIndex, seasonIndex, event.target.value)
                            }
                            placeholder='Season dates'
                          />
                        </th>
                        {season.cells.map((cell, cellIndex) => (
                          <td className='px-3 py-3 align-top' key={cell.groupBand}>
                            <div className='grid gap-1'>
                              <Input
                                aria-label={`${season.label || `Season ${seasonIndex + 1}`} ${cell.groupBand} price`}
                                inputMode='numeric'
                                value={cell.price}
                                onChange={(event) =>
                                  updatePrice(tierIndex, seasonIndex, cellIndex, event.target.value)
                                }
                                placeholder='Price'
                              />
                              {groupJoining ? null : (
                                <span className='text-muted-foreground text-[10px]'>
                                  per person
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                        <td className='px-3 py-3 text-center align-middle'>
                          <span className='text-muted-foreground inline-flex rounded-md border border-dashed px-3 py-2 text-[11px] font-semibold uppercase tracking-wide'>
                            Book CTA
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => addSeason(tierIndex)}
              >
                <Icons.add className='mr-2 size-4' />
                Add season row
              </Button>
            </div>
          </div>
        );
      })}

      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={usedTierKeys.size >= PRICING_TIER_OPTIONS.length}
        onClick={() => {
          const nextTier =
            PRICING_TIER_OPTIONS.find((option) => !usedTierKeys.has(option.value))?.value ??
            'custom';
          onChange([...tiers, createDefaultLegacyPricingTier(nextTier)]);
        }}
      >
        <Icons.add className='mr-2 size-4' />
        Add pricing tier
      </Button>
    </div>
  );
}

function MountainPricingInput({
  value,
  onChange
}: {
  value: PricingTier[];
  onChange: (next: PricingTier[]) => void;
}) {
  const tier = value[0] ?? createDefaultMountainPricingTier();
  const season = tier.seasons[0] ?? createMountainPricingSeason();

  function updatePrice(cellIndex: number, price: string) {
    onChange([
      {
        ...tier,
        seasons: [
          {
            ...season,
            cells: season.cells.map((cell, index) =>
              index === cellIndex ? { ...cell, price } : cell
            )
          }
        ]
      }
    ]);
  }

  return (
    <div className='overflow-hidden rounded-lg border border-[#3C5142]/30 bg-background shadow-sm'>
      <div className='bg-[#3C5142] px-4 py-3 text-white'>
        <h4 className='font-semibold'>{tier.label || 'Route pricing'}</h4>
        <p className='mt-1 text-sm text-white/80'>Per person · USD</p>
      </div>
      <div className='grid gap-3 p-4'>
        {season.cells.map((cell, cellIndex) => (
          <div className='grid gap-2' key={cell.groupBand}>
            <Label>{cell.groupBand}</Label>
            <Input
              inputMode='decimal'
              placeholder='e.g. 1480'
              value={cell.price}
              onChange={(event) => updatePrice(cellIndex, event.target.value)}
            />
          </div>
        ))}
        <p className='text-muted-foreground text-xs'>
          Leave blank only if the price should show as &ldquo;On request&rdquo; on the public site.
        </p>
      </div>
    </div>
  );
}
