/** WordPress-style status views for the safari tours list table. */
export type TourListStatus = 'all' | 'published' | 'draft' | 'trash';

export interface TourListItem {
  id: string;
  title: string;
  slug: string;
  /** `published` | `draft` | `trash` (archived in DB). */
  status: string;
  days: number | null;
  nights: number | null;
  /** Lowest listed rate, in USD. Null when the document has no price. */
  priceFrom: number | null;
  /** Publish timestamp from the English translation (null when never published). */
  publishedAt: string | null;
  updatedAt: string;
  trashed: boolean;
  catalogGroup: string;
  /** 0-100 readiness score from the same checks used in the tour wizard. */
  seoScore: number;
}

export interface TourListParams {
  status: TourListStatus;
  search: string;
  /** Month filter as `YYYY-MM`; empty string means "all dates". */
  month: string;
  /** Catalog group id. Empty string means every collection. */
  catalog: string;
  /** 1-based page index. */
  page: number;
}

export interface TourStatusCounts {
  all: number;
  published: number;
  draft: number;
  trash: number;
}

export interface TourListResult {
  items: TourListItem[];
  /** Total rows matching the active filters (drives pagination). */
  total: number;
  page: number;
  pageSize: number;
  counts: TourStatusCounts;
  /** Distinct publish months for the date dropdown. */
  months: Array<{ value: string; label: string }>;
}

/** Fields editable from the inline Quick Edit row. */
export interface TourQuickEditInput {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  /** ISO timestamp for the publish date/time, or empty to leave unset. */
  publishedAt: string;
}

export const TOURS_PAGE_SIZE = 20;
