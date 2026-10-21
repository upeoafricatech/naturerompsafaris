import * as z from 'zod';

import { TOUR_SAFARI_MARKET_IDS } from '@/features/experiences/public/tour-markets';

import { SEO_LIMITS } from '../seo/analyze';

export const tourSafariMarketIdSchema = z.enum(TOUR_SAFARI_MARKET_IDS);

const faqItemSchema = z.object({
  answer: z.string(),
  question: z.string()
});

const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
  /** media_assets id — public page falls back to gallery when empty */
  imageId: z.string(),
  accommodationOptions: z.array(z.string()),
  mealPlan: z.string()
});

export type ItineraryDay = z.infer<typeof itineraryDaySchema>;

/** Normalizes stored jsonb itinerary rows for the wizard form. */
export function normalizeItineraryDays(value: unknown): ItineraryDay[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const accommodationRaw = record.accommodationOptions ?? record.accommodation_options;
    return [
      {
        day: typeof record.day === 'number' ? record.day : index + 1,
        title: typeof record.title === 'string' ? record.title : '',
        description: typeof record.description === 'string' ? record.description : '',
        imageId: typeof record.imageId === 'string' ? record.imageId : '',
        accommodationOptions: Array.isArray(accommodationRaw)
          ? accommodationRaw.filter((entry): entry is string => typeof entry === 'string')
          : [],
        mealPlan:
          typeof record.mealPlan === 'string'
            ? record.mealPlan
            : typeof record.meal_plan === 'string'
              ? record.meal_plan
              : ''
      }
    ];
  });
}

const routeLegSchema = z.object({
  from: z.string(),
  to: z.string()
});

export type RouteLeg = z.infer<typeof routeLegSchema>;

export const experiencePricingTableKeySchema = z.enum([
  'economy',
  'budget',
  'mid_range',
  'luxury',
  'high_end',
  'custom'
]);

export type ExperiencePricingTableKey = z.infer<typeof experiencePricingTableKeySchema>;

const pricingCellSchema = z.object({
  groupBand: z.string(),
  price: z.string()
});

const pricingSeasonSchema = z.object({
  label: z.string(),
  dateStart: z.string(),
  dateEnd: z.string(),
  cells: z.array(pricingCellSchema)
});

const pricingTierSchema = z.object({
  tier: experiencePricingTableKeySchema,
  label: z.string(),
  blurb: z.string(),
  notes: z.string(),
  currency: z.string(),
  seasons: z.array(pricingSeasonSchema)
});

export type PricingCell = z.infer<typeof pricingCellSchema>;
export type PricingSeason = z.infer<typeof pricingSeasonSchema>;
export type PricingTier = z.infer<typeof pricingTierSchema>;

/**
 * Tour wizard form contract.
 *
 * Spans the base `tours` row, its English `tour_translations` row, and the
 * many-to-many relations (`tour_national_parks`, `tour_destinations`, …). The
 * service splits these back out when persisting. Numeric facts (days, nights,
 * price) are strings here to match the inputs; the service parses them.
 */
export const tourFormSchema = z.object({
  // Translation (en)
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().max(280, 'Keep the excerpt under 280 characters'),
  overview: z.string(),
  importantNotice: z.string(),
  faqs: z.array(faqItemSchema),
  // Base
  days: z.string(),
  nights: z.string(),
  priceFrom: z.string(),
  startLocation: z.string(),
  endLocation: z.string(),
  routeLegs: z.array(routeLegSchema),
  itineraryDays: z.array(itineraryDaySchema),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  pricingTiers: z.array(pricingTierSchema),
  pricingExperienceId: z.string(),
  pricingTableKeys: z.array(experiencePricingTableKeySchema).max(3),
  gallery: z.array(z.string()),
  /** Filing group so lodge, group-joining, coast, and climbing trips stay together. */
  catalogGroup: z.string(),
  /** Safari markets. Same country ids as experiences, plus east-africa for multi-country trips. */
  countries: z.array(tourSafariMarketIdSchema).min(1, 'Select at least one safari market'),
  // Relations
  parkIds: z.array(z.string()),
  destinationIds: z.array(z.string()),
  experienceIds: z.array(z.string()),
  accommodationIds: z.array(z.string()),
  fleetIds: z.array(z.string()),
  // SEO
  seoTitle: z.string().transform((value) => value.slice(0, SEO_LIMITS.titleMax)),
  seoDescription: z
    .string()
    .max(SEO_LIMITS.metaMax, `SEO description should be under ${SEO_LIMITS.metaMax} characters`),
  focusKeyword: z.string(),
  keywords: z
    .array(z.string())
    .max(SEO_LIMITS.maxKeywords, `Up to ${SEO_LIMITS.maxKeywords} keywords`)
});

export type TourFormValues = z.infer<typeof tourFormSchema>;

/** Per-step validators consumed by `useFormStepper`. */
export const tourStepSchemas = [
  tourFormSchema.pick({
    title: true,
    slug: true,
    excerpt: true,
    days: true,
    nights: true,
    priceFrom: true,
    startLocation: true,
    endLocation: true,
    routeLegs: true,
    catalogGroup: true
  }),
  tourFormSchema.pick({ itineraryDays: true }),
  tourFormSchema.pick({
    countries: true,
    parkIds: true,
    destinationIds: true,
    experienceIds: true,
    accommodationIds: true,
    fleetIds: true,
    inclusions: true,
    exclusions: true
  }),
  tourFormSchema.pick({ gallery: true }),
  tourFormSchema.pick({ overview: true, importantNotice: true, faqs: true }),
  tourFormSchema
    .pick({
      pricingExperienceId: true,
      pricingTableKeys: true,
      pricingTiers: true
    })
    .refine(
      (data) => {
        if (data.pricingExperienceId && data.pricingTableKeys.length) return true;
        return data.pricingTiers.some((tier) => tier.seasons.some((season) => season.label.trim()));
      },
      { message: 'Select at least one experience pricing table or enable legacy pricing' }
    ),
  tourFormSchema.pick({
    seoTitle: true,
    seoDescription: true,
    focusKeyword: true,
    keywords: true
  }),
  z.object({})
];

export const tourWizardSteps = [
  { title: 'Basics & Route', description: 'Title, duration, price, and map start / end points.' },
  { title: 'Itinerary', description: 'Day-by-day plan shown on the public tour page.' },
  {
    title: 'Links',
    description: 'Safari markets, parks, destinations, experiences, lodges, and inclusions.'
  },
  { title: 'Gallery', description: 'Choose the images shown on this tour.' },
  { title: 'Story', description: 'Overview, notices, and traveler FAQs.' },
  {
    title: 'Pricing',
    description: 'Choose the price table for this collection, then enter the rates.'
  },
  { title: 'SEO', description: 'Search appearance, keywords, and readiness score.' },
  { title: 'Review', description: 'Confirm everything, then save or publish.' }
];

/** Minimum fields required to save a draft (title + slug). */
export const tourDraftGateSchema = tourStepSchemas[0];

/** Strips server-only record fields before passing wizard defaults to the client form. */
export function toTourFormValues(
  record: TourFormValues & { id?: string; status?: string }
): TourFormValues {
  const { id: _id, status: _status, ...values } = record;
  return values;
}

/** Merges partial wizard input with defaults so draft saves persist in-progress work. */
export function mergeTourDraftValues(input: TourFormValues): TourFormValues {
  return {
    ...emptyTourValues,
    ...input,
    countries: input.countries.length ? input.countries : emptyTourValues.countries
  };
}

export const emptyTourValues: TourFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  overview: '',
  importantNotice: '',
  faqs: [],
  days: '',
  nights: '',
  priceFrom: '',
  startLocation: '',
  endLocation: '',
  routeLegs: [],
  itineraryDays: [],
  inclusions: [],
  exclusions: [],
  pricingTiers: [],
  pricingExperienceId: '',
  pricingTableKeys: [],
  gallery: [],
  catalogGroup: '',
  countries: ['kenya'],
  parkIds: [],
  destinationIds: [],
  experienceIds: [],
  accommodationIds: [],
  fleetIds: [],
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  keywords: []
};
