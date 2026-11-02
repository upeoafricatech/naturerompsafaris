import type { Metadata } from 'next';

import type { PageHeroKey } from '@/lib/public/page-heroes';
import { getPageHero } from '@/lib/public/site-data';
import { buildMetadata, buildStaticLanguageAlternates } from '@/lib/seo';

type ListingMetadataInput = {
  canonicalPath: string;
  defaultDescription: string;
  defaultTitle: string;
  hasFilters?: boolean;
  heroKey?: PageHeroKey;
  imageAlt?: string | null;
  imageUrl?: string | null;
  locale: string;
};

export function hasSearchParams(params: Record<string, string | undefined>) {
  return Object.values(params).some((value) => value?.trim());
}

export async function buildListingPageMetadata({
  canonicalPath,
  defaultDescription,
  defaultTitle,
  hasFilters = false,
  heroKey,
  imageAlt,
  imageUrl,
  locale
}: ListingMetadataInput): Promise<Metadata> {
  const pageHero = heroKey ? await getPageHero(heroKey) : null;
  const title = pageHero?.heading ?? defaultTitle;
  const description = pageHero?.subheading ?? defaultDescription;
  const localePrefix = `/${locale}`;
  const hasLocalePrefix =
    canonicalPath === localePrefix || canonicalPath.startsWith(`${localePrefix}/`);
  const languages = buildStaticLanguageAlternates(
    hasLocalePrefix ? canonicalPath.slice(localePrefix.length) : canonicalPath
  );

  return buildMetadata({
    canonicalPath,
    description,
    imageAlt: imageAlt ?? title,
    imageUrl: imageUrl ?? undefined,
    languages,
    noIndex: hasFilters,
    title
  });
}
