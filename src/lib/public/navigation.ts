import type { PublicAccommodation } from '@/features/accommodations/public/types';

import { buildLegalFooterLinks } from './legal-content';
import { localePath } from './locale-path';
import { publicTourCollectionsForMenu } from './tour-collections';
import type {
  PublicDestination,
  PublicExperienceMenuItem,
  PublicFooterColumn,
  PublicMegaMenu,
  PublicNavItem
} from './types';

function lp(locale: string, path: string) {
  return localePath(locale, path);
}

/** The countries Nature Romp operates in, in preferred column order, with flags. */
const COUNTRY_COLUMNS: { country: string; slug: string; flag: string }[] = [
  { country: 'Kenya', slug: 'kenya', flag: '🇰🇪' },
  { country: 'Tanzania', slug: 'tanzania', flag: '🇹🇿' },
  { country: 'Uganda', slug: 'uganda', flag: '🇺🇬' },
  { country: 'Rwanda', slug: 'rwanda', flag: '🇷🇼' },
  { country: 'South Africa', slug: 'south-africa', flag: '🇿🇦' }
];

function countrySlug(country: string) {
  return country.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Builds the Destinations hover mega menu: one column per operating country,
 * each listing its published destinations, plus a featured promo card. Columns
 * render even with no destinations yet (the design stays in place as trips are
 * added one by one).
 */
export function buildDestinationsMegaMenu(
  locale: string,
  destinations: PublicDestination[]
): PublicMegaMenu {
  const path = (route: string) => lp(locale, route);

  // Group destinations by their country (case-insensitive).
  const byCountry = new Map<string, PublicDestination[]>();
  for (const destination of destinations) {
    const key = (destination.country ?? '').trim().toLowerCase();
    if (!key) continue;
    const list = byCountry.get(key) ?? [];
    list.push(destination);
    byCountry.set(key, list);
  }

  // Start from the preset countries, then append any extra countries present in
  // the data that are not already covered.
  const presetKeys = new Set(COUNTRY_COLUMNS.map((column) => column.country.toLowerCase()));
  const extraColumns = [...byCountry.keys()]
    .filter((key) => !presetKeys.has(key))
    .map((key) => {
      const sample = byCountry.get(key)?.[0];
      const country = sample?.country ?? key;
      return { country, slug: countrySlug(country), flag: '🌍' };
    });

  const columns = [...COUNTRY_COLUMNS, ...extraColumns].map((column) => {
    const list = (byCountry.get(column.country.toLowerCase()) ?? []).toSorted((a, b) =>
      a.name.localeCompare(b.name)
    );
    return {
      country: column.country,
      flag: column.flag,
      href: path(`/destinations?country=${column.slug}`),
      destinations: list.map((destination) => ({
        label: destination.name,
        href: destination.href
      }))
    };
  });

  const featuredSource = destinations.find((destination) => destination.imageUrl) ?? null;

  return {
    columns,
    featured: {
      title: 'Not sure where to go?',
      description:
        'Tell us how you like to travel and our experts will craft a tailor-made safari.',
      cta: 'Plan my safari',
      href: path('/contact'),
      imageUrl: featuredSource?.imageUrl ?? null,
      imageAlt: featuredSource?.imageAlt ?? 'Safari landscape'
    }
  };
}

function uniqueLinks(links: PublicNavItem[]): PublicNavItem[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function titleCaseCountry(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

type CountryMenuRecord = { country: string | null; href: string; name: string };

/**
 * Groups published records (destinations/accommodations) by country into hover
 * mega-menu tabs. Each tab links to the filtered listing and carries its own
 * items (the actual published records) which the header renders as a preview
 * column. Preset operating countries lead the order; any extra countries found
 * in the data follow alphabetically. Countries with no published records are
 * omitted, so the menu always mirrors what is live.
 */
function buildCountryMenuTabs(
  locale: string,
  basePath: string,
  records: CountryMenuRecord[]
): PublicNavItem[] {
  const byCountry = new Map<string, CountryMenuRecord[]>();
  for (const record of records) {
    const key = (record.country ?? '').trim().toLowerCase();
    if (!key) continue;
    byCountry.set(key, [...(byCountry.get(key) ?? []), record]);
  }

  const presetKeys = COUNTRY_COLUMNS.map((column) => column.country.toLowerCase());
  const extraKeys = [...byCountry.keys()]
    .filter((key) => !presetKeys.includes(key))
    .toSorted((a, b) => a.localeCompare(b));

  return [...presetKeys, ...extraKeys]
    .filter((key) => byCountry.has(key))
    .map((key) => {
      const group = byCountry.get(key) ?? [];
      const preset = COUNTRY_COLUMNS.find((column) => column.country.toLowerCase() === key);
      const sampleCountry = group[0]?.country ?? key;
      const label = preset?.country ?? titleCaseCountry(sampleCountry);
      const slug = preset?.slug ?? countrySlug(sampleCountry);

      return {
        flag: preset?.flag ?? '🌍',
        label,
        href: lp(locale, `${basePath}?country=${slug}`),
        items: group
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map((record) => ({ label: record.name, href: record.href }))
      } satisfies PublicNavItem;
    });
}

const EXPERIENCE_MENU_GROUPS: Array<{
  id: PublicExperienceMenuItem['menuGroup'];
  label: string;
}> = [
  { id: 'top_experiences', label: 'Top Experiences' },
  { id: 'wildlife_safari', label: 'Wildlife Safari' }
];

function buildExperienceMenuTabs(
  locale: string,
  items: PublicExperienceMenuItem[]
): PublicNavItem[] {
  const grouped = EXPERIENCE_MENU_GROUPS.map((group) => ({
    label: group.label,
    href: lp(locale, `/experiences?group=${group.id}`),
    items: items
      .filter((item) => item.menuGroup === group.id)
      .map((item) => ({ label: item.label, href: item.href }))
  })).filter((group) => group.items.length > 0);

  return grouped;
}

function collectionLinks(locale: string, menu: 'kenya' | 'tanzania' | 'combined'): PublicNavItem[] {
  return publicTourCollectionsForMenu(menu).map((item) => ({
    label: item.label,
    href: lp(locale, 'navPath' in item ? item.navPath : `/tours?collection=${item.id}`)
  }));
}

export function safariTourNavItems(locale: string): PublicNavItem[] {
  const path = (route: string) => lp(locale, route);
  return [
    {
      label: 'Kenya',
      href: path('/tours?country=kenya'),
      items: [
        { label: 'All Kenya safaris', href: path('/tours?country=kenya') },
        ...collectionLinks(locale, 'kenya')
      ]
    },
    {
      label: 'Tanzania',
      href: path('/tours?country=tanzania'),
      items: [
        { label: 'All Tanzania safaris', href: path('/tours?country=tanzania') },
        ...collectionLinks(locale, 'tanzania')
      ]
    },
    {
      label: 'Kenya & Tanzania',
      href: path('/tours?collection=combined'),
      items: collectionLinks(locale, 'combined')
    }
  ];
}

export function buildPublicNavigation(
  locale: string,
  destinations: PublicDestination[] = [],
  accommodations: PublicAccommodation[] = [],
  experienceMenuItems: PublicExperienceMenuItem[] = []
): PublicNavItem[] {
  const path = (route: string) => lp(locale, route);

  // Experiences: published items only, shown as two titled columns on hover.
  const experienceTabs = buildExperienceMenuTabs(locale, experienceMenuItems);

  const destinationTabs = buildCountryMenuTabs(
    locale,
    '/destinations',
    destinations.map((destination) => ({
      country: destination.country,
      href: destination.href,
      name: destination.name
    }))
  );

  const accommodationTabs = buildCountryMenuTabs(
    locale,
    '/accommodations',
    accommodations.map((accommodation) => ({
      country: accommodation.country,
      href: accommodation.href,
      name: accommodation.name
    }))
  );

  return [
    { label: 'About Us', href: path('/about'), variant: 'simple' },
    {
      label: 'Destinations',
      href: path('/destinations'),
      items: destinationTabs,
      variant: destinationTabs.length ? 'dynamic' : 'simple'
    },
    {
      label: 'Safari Tours',
      href: path('/tours'),
      items: safariTourNavItems(locale),
      variant: 'columns'
    },
    {
      label: 'Experiences',
      href: path('/experiences'),
      items: experienceTabs,
      variant: experienceTabs.length ? 'columns' : 'simple'
    },
    {
      label: 'Accommodation',
      href: path('/accommodations'),
      items: accommodationTabs,
      variant: accommodationTabs.length ? 'dynamic' : 'simple'
    },
    { label: 'Blog', href: path('/blog'), variant: 'simple' },
    { label: 'Contact Us', href: path('/contact'), variant: 'simple' }
  ];
}

export function buildFooterNavigation(locale: string): PublicFooterColumn[] {
  const path = (route: string) => lp(locale, route);

  const quickLinks = uniqueLinks([
    { label: 'Travel Information', href: path('/blog') },
    { label: 'Safari Tours', href: path('/tours') },
    { label: 'Safari Packages', href: path('/safari-packages') },
    { label: 'Contact', href: path('/contact') }
  ]);

  const safariLinks = uniqueLinks(
    safariTourNavItems(locale).flatMap((column) => column.items ?? [])
  );

  const policyLinks = buildLegalFooterLinks(locale);

  return [
    { title: 'Quick Links', links: quickLinks },
    { title: 'Our Safaris', links: safariLinks },
    { title: 'Help & Policies', links: policyLinks }
  ];
}
