import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TourDetailShell } from '@/components/public/tour-detail-shell';
import { getPublicTourDetail, getSimilarToursForTour } from '@/lib/public/site-data';
import { buildAlternates, buildMetadata, buildTouristTripJsonLd } from '@/lib/seo';
import { createClient } from '@/lib/supabase/server';

type TourPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata(props: TourPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const supabase = await createClient();

  const { data: tour } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      locale,
      title,
      excerpt,
      seo_title,
      seo_description,
      tour:tours!inner(id, status),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .maybeSingle();

  if (!tour) notFound();

  const parent = Array.isArray(tour.tour) ? tour.tour[0] : tour.tour;
  if (!parent?.id) notFound();

  const title = tour.seo_title || `${tour.title} | Safari Tour`;
  const description = tour.seo_description || tour.excerpt;
  const languages = await buildAlternates({
    parentId: parent.id,
    parentKey: 'tour_id',
    pathBuilder: (item) => `/${item.locale}/tours/${item.slug}`,
    table: 'tour_translations'
  });
  const ogImage = tour.og_image as { alt?: string | null; url?: string | null } | null;

  return buildMetadata({
    canonicalPath: `/${locale}/tours/${slug}`,
    description,
    imageAlt: ogImage?.alt ?? tour.title,
    imageUrl: ogImage?.url ?? undefined,
    languages,
    title,
    type: 'website'
  });
}

export default async function TourDetailPage({ params }: TourPageProps) {
  const { locale, slug } = await params;
  const tour = await getPublicTourDetail(locale, slug);

  if (!tour) notFound();

  const similarTours = await getSimilarToursForTour(locale, tour.id);
  const primaryDestination = tour.destinationLabels?.[0] ?? null;

  const jsonLd = buildTouristTripJsonLd(
    {
      days: tour.days,
      excerpt: tour.excerpt,
      locale,
      price_from: tour.priceFrom,
      slug: tour.slug,
      title: tour.title
    },
    `/${locale}/tours/${tour.slug}`
  );

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TourDetailShell
        locale={locale}
        primaryDestination={primaryDestination}
        similarTours={similarTours}
        tour={tour}
      />
    </>
  );
}
