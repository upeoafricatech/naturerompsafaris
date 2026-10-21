'use client';

import * as React from 'react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { enquiriesListQueryOptions } from '@/features/enquiries/api/queries';
import type { Enquiry, EnquiryStatus, EnquiryType } from '@/features/enquiries/api/types';
import { EnquiriesViewTabs } from '@/features/enquiries/components/enquiries-view-tabs';
import { EnquiryAccordionPanel } from '@/features/enquiries/components/enquiry-accordion-panel';
import { EnquiryStatusBadge } from '@/features/enquiries/components/enquiry-status-badge';
import { EnquiryTypeBadge } from '@/features/enquiries/components/enquiry-type-badge';
import {
  ENQUIRY_STATUS_FILTERS,
  ENQUIRY_TYPE_META
} from '@/features/enquiries/constants/enquiry-labels';
import {
  getEnquiryBudgetTierLabel,
  getEnquiryDestinationLabel
} from '@/features/enquiries/utils/enquiry-display-fields';
import { CmsEnquiryRowsSkeleton } from '@/features/portal/cms/shared/cms-table-skeleton';
import { EmptyCmsState } from '@/features/portal/cms/shared/empty-cms-state';
import { CMS_SURFACE } from '@/features/portal/cms/shared/surface';
import { cn } from '@/lib/utils';

const TYPE_FILTERS: Array<{ label: string; value: EnquiryType | 'all' }> = [
  { value: 'all', label: 'All types' },
  ...Object.entries(ENQUIRY_TYPE_META).map(([value, meta]) => ({
    value: value as EnquiryType,
    label: meta.label
  }))
];

const PORTAL_SELECT_TRIGGER = cn(CMS_SURFACE, 'bg-white text-[#111827] shadow-xs hover:bg-white');

const ENQUIRY_ROW_GRID =
  'grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[minmax(140px,1.25fr)_minmax(84px,0.72fr)_minmax(96px,1fr)_minmax(84px,0.72fr)_minmax(88px,0.68fr)_minmax(72px,0.62fr)] sm:items-center sm:gap-x-3';

const listParsers = {
  status: parseAsStringEnum<EnquiryStatus | 'all'>([
    'all',
    'pending',
    'deal',
    'no-deal'
  ]).withDefault('all'),
  type: parseAsStringEnum<EnquiryType | 'all'>([
    'all',
    'safari-quote',
    'general',
    'other',
    'accommodation-inquiry',
    'trip-inquiry'
  ]).withDefault('all'),
  s: parseAsString.withDefault(''),
  paged: parseAsInteger.withDefault(1)
};

function formatReceivedAt(value: string) {
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

type EnquiryAccordionItemProps = {
  enquiry: Enquiry;
  expanded: boolean;
  onOpenChange: (id: string, open: boolean) => void;
  onPrint: (enquiry: Enquiry) => void;
};

function EnquiryAccordionItem({
  enquiry,
  expanded,
  onOpenChange,
  onPrint
}: EnquiryAccordionItemProps) {
  const budgetTier = getEnquiryBudgetTierLabel(enquiry);
  const destination = getEnquiryDestinationLabel(enquiry);

  return (
    <Collapsible onOpenChange={(open) => onOpenChange(enquiry.id, open)} open={expanded}>
      <div
        className={cn(
          'border-b border-[#E5E7EB] last:border-b-0',
          enquiry.status === 'pending' && !expanded && 'bg-[#3C5142]/[0.04]',
          expanded && 'bg-[#FBF6EF] shadow-sm'
        )}
      >
        <div className='flex items-start gap-2 px-4 py-3 sm:items-center sm:gap-3 sm:px-5 sm:py-3.5'>
          <CollapsibleTrigger asChild>
            <button
              aria-expanded={expanded}
              className={cn(
                'flex min-w-0 flex-1 items-start gap-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#3C5142]/30 focus-visible:outline-none sm:items-center sm:gap-4',
                expanded ? 'hover:bg-[#F5F0E8]/60' : 'hover:bg-[#F9FAFB]'
              )}
              type='button'
            >
              <Icons.chevronDown
                className={cn(
                  'text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform sm:mt-0',
                  expanded && 'rotate-180'
                )}
              />

              <div className={ENQUIRY_ROW_GRID}>
                <div className='min-w-0'>
                  <div className='font-medium text-[#111827]'>{enquiry.name}</div>
                  <div className='text-muted-foreground mt-0.5 font-mono text-[11px] tracking-wide'>
                    {enquiry.referenceCode}
                  </div>
                </div>

                <div className='sm:flex sm:items-center'>
                  <EnquiryTypeBadge type={enquiry.enquiryType} />
                </div>

                <p className='text-muted-foreground line-clamp-2 text-sm sm:truncate sm:line-clamp-none'>
                  {destination}
                </p>

                <div className='sm:flex sm:items-center'>
                  <EnquiryStatusBadge status={enquiry.status} />
                </div>

                <span className='text-muted-foreground text-sm sm:truncate'>
                  {budgetTier ?? '—'}
                </span>

                <span
                  className='text-muted-foreground text-sm whitespace-nowrap sm:text-right'
                  title={new Date(enquiry.createdAt).toLocaleString()}
                >
                  {formatReceivedAt(enquiry.createdAt)}
                </span>
              </div>
            </button>
          </CollapsibleTrigger>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label='Print enquiry'
                className='size-8 shrink-0 text-[#374151]'
                onClick={(event) => {
                  event.stopPropagation();
                  onPrint(enquiry);
                }}
                size='icon'
                type='button'
                variant='ghost'
              >
                <Icons.print className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Print</TooltipContent>
          </Tooltip>
        </div>

        <CollapsibleContent>
          <EnquiryAccordionPanel
            enquiry={enquiry}
            onClose={() => onOpenChange(enquiry.id, false)}
            onPrint={() => onPrint(enquiry)}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function EnquiriesList() {
  const router = useRouter();
  const [params, setParams] = useQueryStates(listParsers, { shallow: true });
  const { status, type, s: search, paged: page } = params;
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const [searchInput, setSearchInput] = React.useState(search);

  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  React.useEffect(() => {
    setExpandedId(null);
  }, [status, type, search, page]);

  const { data, isFetching, isPending, refetch } = useQuery({
    ...enquiriesListQueryOptions({ enquiryType: type, page, search, status }),
    placeholderData: keepPreviousData,
    // No fixed polling interval: an open, focused tab must not run a Server
    // Action + DB count every 30s forever (idle CPU burn on Vercel Fluid).
    // Data refreshes when staff return to the tab or use the manual Refresh
    // button; staleTime keeps quick navigations from refetching needlessly.
    staleTime: 60_000,
    refetchOnWindowFocus: true
  });
  const showSkeleton = isPending || (isFetching && !data);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasFilters = status !== 'all' || type !== 'all' || Boolean(search);
  const pageSize = data?.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pendingCount = data?.counts.pending ?? 0;
  const trashCount = data?.counts.trash ?? 0;

  function handleAccordionOpenChange(id: string, open: boolean) {
    if (open) {
      setExpandedId(id);
      return;
    }
    setExpandedId((current) => (current === id ? null : current));
  }

  function openPrint(enquiry: Enquiry) {
    router.push(`/portal/enquiries/${enquiry.id}?print=1`);
  }

  return (
    <div className='space-y-4'>
      <EnquiriesViewTabs trashCount={trashCount} variant='active' />

      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex flex-wrap items-center gap-2'>
          <Select
            onValueChange={(value) =>
              setParams({ status: value as EnquiryStatus | 'all', paged: 1 })
            }
            value={status}
          >
            <SelectTrigger className={cn(PORTAL_SELECT_TRIGGER, 'w-[180px]')}>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              {ENQUIRY_STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {option.value === 'pending' && pendingCount > 0 ? (
                    <span className='text-muted-foreground ml-1.5'>({pendingCount})</span>
                  ) : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => setParams({ type: value as EnquiryType | 'all', paged: 1 })}
            value={type}
          >
            <SelectTrigger className={cn(PORTAL_SELECT_TRIGGER, 'w-[180px]')}>
              <SelectValue placeholder='Filter by type' />
            </SelectTrigger>
            <SelectContent className={CMS_SURFACE}>
              {TYPE_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <form
            className='flex gap-2'
            onSubmit={(event) => {
              event.preventDefault();
              setParams({ s: searchInput.trim(), paged: 1 });
            }}
          >
            <Input
              className='w-[220px] bg-white'
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder='Search name, email, reference...'
              value={searchInput}
            />
            <Button size='sm' type='submit' variant='secondary'>
              <Icons.search className='size-4' />
            </Button>
          </form>

          <Button
            disabled={isFetching}
            onClick={() => refetch()}
            size='sm'
            type='button'
            variant='ghost'
          >
            <Icons.spinner className={cn('size-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      <div className='flex items-center justify-between text-sm'>
        <p className='text-muted-foreground'>
          {total} {total === 1 ? 'enquiry' : 'enquiries'}
        </p>
      </div>

      <div className='overflow-hidden rounded-md border border-[#E5E7EB] bg-white'>
        <div className='hidden border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-2.5 text-[11px] font-medium tracking-wide text-[#374151] uppercase sm:flex sm:items-center sm:gap-3'>
          <span aria-hidden='true' className='size-4 shrink-0' />
          <div className={ENQUIRY_ROW_GRID}>
            <span>Contact</span>
            <span>Type</span>
            <span>Destination</span>
            <span>Status</span>
            <span>Budget tier</span>
            <span className='text-right'>Received</span>
          </div>
          <span aria-hidden='true' className='size-8 shrink-0' />
        </div>

        {showSkeleton ? (
          <CmsEnquiryRowsSkeleton />
        ) : !items.length ? (
          <EmptyCmsState
            message={
              hasFilters
                ? 'Try a different search or clear the filters.'
                : 'New quotes and contact forms from the website will appear here.'
            }
            title={hasFilters ? 'No matching enquiries' : 'No enquiries yet'}
          />
        ) : (
          items.map((enquiry) => (
            <EnquiryAccordionItem
              enquiry={enquiry}
              expanded={expandedId === enquiry.id}
              key={enquiry.id}
              onOpenChange={handleAccordionOpenChange}
              onPrint={openPrint}
            />
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>
            Page {page} of {totalPages}
          </span>
          <div className='flex gap-2'>
            <Button
              disabled={page <= 1 || isFetching}
              onClick={() => setParams({ paged: page - 1 })}
              size='sm'
              type='button'
              variant='outline'
            >
              <Icons.chevronLeft className='size-4' />
              Previous
            </Button>
            <Button
              disabled={page >= totalPages || isFetching}
              onClick={() => setParams({ paged: page + 1 })}
              size='sm'
              type='button'
              variant='outline'
            >
              Next
              <Icons.chevronRight className='size-4' />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
