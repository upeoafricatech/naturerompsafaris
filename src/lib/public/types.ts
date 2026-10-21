import type { TourSafariMarketId } from '@/features/experiences/public/tour-markets';

export type PublicNavItem = {
  /** Optional flag emoji shown on country tabs in the mega menu. */
  flag?: string;
  href: string;
  items?: PublicNavItem[];
  label: string;
  sections?: PublicNavSection[];
  variant?: 'columns' | 'dynamic' | 'mega' | 'simple';
};

export type PublicNavSection = {
  items: PublicNavItem[];
  label: string;
};

export type PublicFooterColumn = {
  links: PublicNavItem[];
  title: string;
};

/** A single country column in the Destinations mega menu. */
export type PublicMegaColumn = {
  country: string;
  href: string;
  /** Flag emoji or null. */
  flag: string | null;
  destinations: { label: string; href: string }[];
};

/** Data backing the Destinations hover mega menu. */
export type PublicMegaMenu = {
  columns: PublicMegaColumn[];
  featured: {
    title: string;
    description: string;
    href: string;
    cta: string;
    imageUrl: string | null;
    imageAlt: string;
  } | null;
};

export type HeroSlide = {
  alt: string | null;
  heading: string | null;
  isActive: boolean;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  posterUrl: string | null;
  sortOrder: number;
  subheading: string | null;
};

/** How a page hero renders its background. */
export type PageHeroType = 'slider' | 'youtube' | 'image';

/** Per-page hero configuration managed in Portal > Settings > Hero Sections. */
export type PageHero = {
  type: PageHeroType;
  /** Background slides — slider rotates them; image/youtube use the first as poster/fallback. */
  slides: HeroSlide[];
  /** YouTube watch/share/embed URL when type === 'youtube'. */
  youtubeUrl: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  /** Dark overlay strength over the media, 0–1. */
  overlayOpacity: number;
};

export type SiteAnalyticsSettings = {
  gaMeasurementId: string | null;
  googleAdsId: string | null;
  gtmId: string | null;
  metaPixelId: string | null;
  googleSiteVerification: string | null;
  bingSiteVerification: string | null;
};

export type PublicSiteSettings = {
  addressShort: string;
  analytics: SiteAnalyticsSettings;
  companyName: string;
  description: string;
  siteName: string;
  email: string;
  faviconUrl: string | null;
  /** ISO timestamp used to cache-bust favicon/logo metadata after CMS updates. */
  faviconVersion: string | null;
  logoUrl: string | null;
  ogImage: string | null;
  phoneOffice: string;
  phonePrimary: string;
  phoneSecondary: string;
  postalAddress: string;
  socialLinks: Record<string, string>;
  tagline: string | null;
  themeColor: string | null;
  whatsappMessage: string;
};

export type PublicDestination = {
  country: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  name: string;
  region: string | null;
  slug: string;
  summary: string | null;
};

export type PublicDestinationMedia = {
  alt: string | null;
  id: string;
  url: string | null;
};

export type PublicDestinationDetail = {
  bestTime: string | null;
  country: string | null;
  descriptionHtml: string | null;
  faqs: { question: string; answer: string }[];
  gallery: PublicDestinationMedia[];
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  name: string;
  region: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  summary: string | null;
  wildlife: string[];
};

export type PublicExperienceMenuItem = {
  href: string;
  id: string;
  label: string;
  menuGroup: 'top_experiences' | 'wildlife_safari';
  menuPosition: number;
};

export type PublicTour = {
  catalogGroup?: string | null;
  countryIds?: TourSafariMarketId[];
  countryLabels?: string[];
  days: number | null;
  destinationLabels?: string[];
  excerpt: string | null;
  experienceLabels?: string[];
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  nights: number | null;
  parkLabels?: string[];
  parkSlugs?: string[];
  priceFrom: number | null;
  pricingTiers?: PublicTourPricingTier[];
  slug: string;
  title: string;
};

export type PublicTourItineraryDay = {
  day: number;
  title: string;
  description: string;
  imageId: string;
  imageUrl: string | null;
  imageAlt: string | null;
  accommodationOptions: string[];
  mealPlan: string;
};

export type PublicTourRouteLeg = {
  from: string;
  to: string;
};

export type PublicTourPricingCell = {
  groupBand: string;
  price?: number | null;
};

export type PublicTourPricingSeason = {
  id: string;
  label: string;
  dateStart: string | null;
  dateEnd: string | null;
  cells: PublicTourPricingCell[];
};

export type PublicTourPricingTier = {
  id: string;
  tier: 'budget' | 'mid_range' | 'luxury';
  label: string;
  blurb: string | null;
  notes: string | null;
  currency: string;
  seasons: PublicTourPricingSeason[];
};

export type PublicTourDetail = PublicTour & {
  accommodations: PublicAccommodation[];
  descriptionHtml: string | null;
  endLocation: string | null;
  exclusions: string[];
  faqs: { question: string; answer: string }[];
  gallery: PublicDestinationMedia[];
  importantNotice: string | null;
  inclusions: string[];
  itineraryDays: PublicTourItineraryDay[];
  routeLegs: PublicTourRouteLeg[];
  startLocation: string | null;
};

export type PublicTourCatalogFacets = {
  /** Collection ids that match at least one published tour. */
  collectionIds: string[];
  /** Country market slugs present on at least one published tour. */
  countrySlugs: string[];
  destinationLabels: string[];
  durationBounds: {
    max: number;
    min: number;
  };
  experienceLabels: string[];
  parkOptions: Array<{ label: string; slug: string }>;
  priceBounds: {
    max: number;
    min: number;
  };
  pricingTiers: PublicTourPricingTier['tier'][];
};

export type PublicTourCatalogFilters = {
  collection?: string;
  country?: string;
  destination?: string[];
  durationMax?: number;
  durationMin?: number;
  experience?: string[];
  park?: string[];
  priceMax?: number;
  priceMin?: number;
  pricingTiers?: PublicTourPricingTier['tier'][];
};

export type PublicPackage = {
  comfortTier: PublicTourPricingTier['tier'] | null;
  excerpt: string | null;
  group: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  priceFrom: number | null;
  slug: string;
  title: string;
  tour: PublicTour | null;
};

export type PublicPackageDetail = PublicPackage & {
  contentHtml: string | null;
  linkedTour: PublicTourDetail | null;
  pricingTier: PublicTourPricingTier | null;
};

export type PublicFleetVehicle = {
  capacity: number | null;
  features: string[];
  gallery: PublicDestinationMedia[];
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  slug: string;
  summary: string | null;
  title: string;
  vehicleType: string | null;
};

export type PublicFleetVehicleDetail = PublicFleetVehicle & {
  descriptionHtml: string | null;
  faqs: { question: string; answer: string }[];
  seoDescription: string | null;
  seoTitle: string | null;
};

export type { PublicExperience } from '@/features/experiences/public/types';

export type PublicBlogPost = {
  category: string | null;
  excerpt: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  slug: string;
  title: string;
};
import type { PublicAccommodation } from '@/features/accommodations/public/types';
