import type { SupabaseClient } from '@supabase/supabase-js';

import { DEFAULT_LOCALE, isPublicLocale, PUBLIC_LOCALES } from '@/lib/i18n';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

type TranslationAlternate = {
  locale: string;
  slug: string;
};

type BuildAlternatesInput = {
  table: string;
  parentId: string;
  parentKey?: string;
  pathBuilder: (item: TranslationAlternate) => string;
};

/**
 * hreflang map (locale -> site-relative path) limited to public locales, with
 * `x-default` on the default locale (or the first public locale when the
 * default has no version). Returns undefined when fewer than two
 * locales exist: a lone self-referencing hreflang adds nothing for crawlers.
 */
export function buildLanguageAlternates(pathsByLocale: Record<string, string>) {
  const entries = Object.entries(pathsByLocale).filter(([locale]) => isPublicLocale(locale));
  if (entries.length < 2) return undefined;

  const languages = Object.fromEntries(entries);
  const fallbackLocale = PUBLIC_LOCALES.find((locale) => languages[locale]);
  const defaultPath =
    languages[DEFAULT_LOCALE] ?? (fallbackLocale ? languages[fallbackLocale] : undefined);
  return defaultPath ? { ...languages, 'x-default': defaultPath } : languages;
}

/** hreflang map for pages that exist at the same path in every public locale. */
export function buildStaticLanguageAlternates(pathWithoutLocale: string) {
  return buildLanguageAlternates(
    Object.fromEntries(PUBLIC_LOCALES.map((locale) => [locale, `/${locale}${pathWithoutLocale}`]))
  );
}

export async function buildAlternates({
  table,
  parentId,
  parentKey = 'post_id',
  pathBuilder
}: BuildAlternatesInput) {
  // Generic, runtime-driven table name: use the untyped client surface since the
  // typed client only accepts literal table names.
  const supabase = createEnquiryPublicClient() as unknown as SupabaseClient;
  const { data } = await supabase
    .from(table)
    .select('locale, slug')
    .eq(parentKey, parentId)
    .not('published_at', 'is', null);

  return buildLanguageAlternates(
    Object.fromEntries(
      ((data as TranslationAlternate[] | null) ?? []).map((item) => [
        item.locale,
        pathBuilder(item)
      ])
    )
  );
}
