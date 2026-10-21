'use client';

import * as React from 'react';

import { Icons } from '@/components/icons';
import { SafariPricingMarketTabs } from '@/components/public/tours/safari-pricing-market-tabs';
import {
  isDayTripPricingTierPublic,
  isGroupJoiningPricingTierPublic
} from '@/features/portal/cms/tours/legacy-pricing';
import {
  formatTourPrice,
  hasPublishedTourPrices,
  splitTourPricingByMarket
} from '@/lib/public/tour-format';
import type { PublicTourPricingTier } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type TourPricingTableProps = {
  locale?: string;
  safariName?: string;
  tiers: PublicTourPricingTier[];
};

function collectBands(tier: PublicTourPricingTier) {
  const bands: string[] = [];
  for (const season of tier.seasons) {
    for (const cell of season.cells) {
      if (!bands.includes(cell.groupBand)) bands.push(cell.groupBand);
    }
  }
  return bands;
}

function formatBandLabel(band: string) {
  const normalized = band.trim().toLowerCase();
  if (normalized.includes('pax') || normalized.includes('person')) return band;
  return `${band} people`;
}

type TierTheme = {
  Icon: typeof Icons.badgeCheck;
  button: string;
  headBg: string;
  headFg: string;
  icon: string;
  title: string;
};

function tierTheme(key: PublicTourPricingTier['tier']): TierTheme {
  if (key === 'budget') {
    return {
      Icon: Icons.badgeCheck,
      button:
        'border-[#5f8a3d] text-[#5f8a3d] hover:border-[#5f8a3d] hover:bg-[#5f8a3d] hover:text-white',
      headBg: '#5f8a3d',
      headFg: '#fff',
      icon: 'bg-[#5f8a3d] text-white',
      title: 'text-[#5f8a3d]'
    };
  }

  if (key === 'luxury') {
    return {
      Icon: Icons.pro,
      button:
        'border-[var(--brand-primary-dark)] text-[var(--brand-primary-dark)] hover:border-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-dark)] hover:text-white',
      headBg: 'var(--brand-primary-dark)',
      headFg: '#fff',
      icon: 'bg-[var(--brand-primary-dark)] text-white',
      title: 'text-[var(--brand-primary-dark)]'
    };
  }

  return {
    Icon: Icons.exclusive,
    button:
      'border-[var(--brand-primary)] text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white',
    headBg: 'var(--brand-primary)',
    headFg: '#fff',
    icon: 'bg-[var(--brand-primary)] text-white',
    title: 'text-[var(--brand-primary)]'
  };
}

function openTourInquiry() {
  window.dispatchEvent(new CustomEvent('brand:open-tour-inquiry'));
}

function PriceCell({
  align = 'center',
  currency,
  price,
  showCaption = true
}: {
  align?: 'center' | 'start';
  currency: string;
  price: number | null | undefined;
  showCaption?: boolean;
}) {
  if (!price) {
    return <span className='text-xs text-[var(--brand-muted)]'>On request</span>;
  }

  return (
    <span
      className={cn(
        'inline-flex flex-col leading-tight',
        align === 'start' ? 'items-start' : 'items-center'
      )}
    >
      <strong className='font-price text-base text-[var(--brand-heading)] sm:text-[1.05rem]'>
        {formatTourPrice(price, currency)}
      </strong>
      {showCaption ? (
        <span className='mt-1 text-[10px] font-normal text-[var(--brand-muted)] sm:text-[11px]'>
          per person
        </span>
      ) : null}
    </span>
  );
}

function PricingTableIntro({
  blurb,
  label,
  theme
}: {
  blurb: string | null;
  label: string;
  theme: TierTheme;
}) {
  const TierIcon = theme.Icon;

  return (
    <div className='brand-pricing-tier__intro'>
      <div className='flex items-start gap-3'>
        <span
          aria-hidden
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            theme.icon
          )}
        >
          <TierIcon className='h-4 w-4' />
        </span>
        <div className='min-w-0'>
          <h3
            className={cn('font-display text-lg font-bold leading-tight sm:text-xl', theme.title)}
          >
            {label}
          </h3>
          {blurb ? (
            <p className='mt-1.5 max-w-3xl text-sm leading-6 text-[var(--brand-muted)]'>{blurb}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PricingOnRequest() {
  return (
    <div className='brand-contact-credentials-box'>
      <h3 className='brand-heading font-display text-xl'>Pricing on Request</h3>
      <p className='brand-body mt-2 text-sm leading-6'>
        Pricing can vary by dates, group size, and lodge availability. Send an enquiry and the team
        will prepare the correct quote.
      </p>
      <button
        className='mt-5 inline-flex items-center gap-2 rounded-[var(--brand-button-radius)] border border-[var(--brand-primary)] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)] hover:text-white'
        onClick={openTourInquiry}
        type='button'
      >
        <Icons.mail className='h-4 w-4' />
        Request Prices
      </button>
    </div>
  );
}

function PricingTierTables({ tiers }: { tiers: PublicTourPricingTier[] }) {
  if (!tiers.length) return <PricingOnRequest />;

  return (
    <div className='space-y-6'>
      {tiers.map((tier) => {
        const bands = collectBands(tier);
        const theme = tierTheme(tier.tier);
        const dayTrip = isDayTripPricingTierPublic(tier);
        const groupJoining = isGroupJoiningPricingTierPublic(tier);
        const seasonWidth = groupJoining ? 46 : bands.length > 4 ? 21 : 23;
        const actionWidth = groupJoining ? 18 : 11;
        const reservedWidth = dayTrip ? actionWidth : seasonWidth + actionWidth;
        const paxWidth = bands.length ? (100 - reservedWidth) / bands.length : 0;
        const headStyle = {
          '--pricing-head-bg': theme.headBg,
          '--pricing-head-fg': theme.headFg
        } as React.CSSProperties;

        return (
          <div
            className={cn(
              'brand-pricing-tier',
              dayTrip && 'brand-pricing-tier--day-trip',
              groupJoining && 'brand-pricing-tier--group-joining'
            )}
            key={tier.id}
          >
            {dayTrip ? null : (
              <PricingTableIntro blurb={tier.blurb} label={tier.label} theme={theme} />
            )}

            {bands.length && tier.seasons.length ? (
              <div className='brand-thin-scrollbar overflow-x-auto lg:overflow-x-visible'>
                <div className='brand-pricing-tier__table-shell'>
                  <table className='brand-pricing-tier__table text-left text-sm'>
                    <colgroup>
                      {dayTrip ? null : <col style={{ width: `${seasonWidth}%` }} />}
                      {bands.map((band) => (
                        <col key={band} style={{ width: `${paxWidth}%` }} />
                      ))}
                      <col style={{ width: `${actionWidth}%` }} />
                    </colgroup>
                    <thead className='brand-pricing-tier__head' style={headStyle}>
                      <tr>
                        {dayTrip ? null : <th scope='col'>Season</th>}
                        {bands.map((band) => (
                          <th key={band} scope='col'>
                            {formatBandLabel(band)}
                          </th>
                        ))}
                        <th scope='col'>Enquire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tier.seasons.map((season) => (
                        <tr className='brand-pricing-tier__row' key={season.id}>
                          {dayTrip ? null : (
                            <th className='brand-pricing-tier__season' scope='row'>
                              {season.label}
                            </th>
                          )}
                          {bands.map((band) => {
                            const cell = season.cells.find((item) => item.groupBand === band);
                            return (
                              <td className='brand-pricing-tier__price tabular-nums' key={band}>
                                <PriceCell
                                  align={groupJoining ? 'start' : 'center'}
                                  currency={tier.currency}
                                  price={cell?.price}
                                  showCaption={!groupJoining}
                                />
                              </td>
                            );
                          })}
                          <td className='brand-pricing-tier__action'>
                            <button
                              className={cn(
                                'inline-flex w-full max-w-[5.25rem] items-center justify-center gap-1 rounded-[var(--brand-button-radius)] border bg-white px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition sm:max-w-none sm:px-2.5 sm:py-2 sm:text-[11px]',
                                theme.button
                              )}
                              onClick={openTourInquiry}
                              type='button'
                            >
                              <Icons.mail className='h-3.5 w-3.5 shrink-0' />
                              Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bands.length > 2 ? (
                  <p className='brand-pricing-tier__scroll-hint'>
                    Swipe the table to see all prices →
                  </p>
                ) : null}
              </div>
            ) : (
              <div className='flex min-h-36 flex-col items-center justify-center gap-3 p-6 text-center'>
                <Icons.info className='h-7 w-7 text-[var(--brand-gold)]' />
                <p className='brand-body max-w-sm text-sm leading-7'>
                  This tier is available, but seasonal prices have not been published yet.
                </p>
                <button
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[var(--brand-button-radius)] border bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
                    theme.button
                  )}
                  onClick={openTourInquiry}
                  type='button'
                >
                  <Icons.mail className='h-4 w-4' />
                  Enquire
                </button>
              </div>
            )}

            {tier.notes ? <p className='brand-pricing-tier__notes'>{tier.notes}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function TourPricingTable({ safariName = '', tiers }: TourPricingTableProps) {
  if (!tiers.length) return <PricingOnRequest />;

  const { international, local } = splitTourPricingByMarket(tiers);
  const localReady = hasPublishedTourPrices(local);

  return (
    <SafariPricingMarketTabs
      international={<PricingTierTables tiers={international} />}
      local={localReady ? <PricingTierTables tiers={local} /> : undefined}
      safariName={safariName}
    />
  );
}
