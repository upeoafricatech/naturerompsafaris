import { PUBLIC_LOCALES } from '@/lib/i18n';
import { PAGE_HERO_REGISTRY } from '@/lib/public/page-heroes';
import { crawlAbsoluteUrl } from '@/lib/seo/absolute-url';

export async function GET() {
  const sitemapUrl = crawlAbsoluteUrl('/sitemap.xml');
  const locales = PUBLIC_LOCALES.join(', ');
  const staticPages = PAGE_HERO_REGISTRY.map((entry) => crawlAbsoluteUrl(`/en${entry.path}`)).join(
    '\n'
  );

  const body = `# Nature Romp Safaris
> East Africa safari operator based in Nairobi, Kenya. Tailor-made Kenya and Tanzania safari adventures.

## About
Nature Romp Safaris plans private safari itineraries with expert guides, lodge and camping options, and Nairobi-based support before, during, and after travel.

- Website: ${crawlAbsoluteUrl('/')}
- Sitemap: ${sitemapUrl}
- Contact: ${crawlAbsoluteUrl('/en/contact')}
- Email: info@naturerompsafaris.com
- Phone: +254 739 206698 / +254 716 512 606

## Locales
Supported languages: ${locales}. Default locale: en.

## Primary content types
- Safari tours and itineraries: ${crawlAbsoluteUrl('/en/tours')}
- Safari packages (comfort tiers): ${crawlAbsoluteUrl('/en/safari-packages')}
- Destinations: ${crawlAbsoluteUrl('/en/destinations')}
- National parks: ${crawlAbsoluteUrl('/en/national-parks')}
- Signature experiences: ${crawlAbsoluteUrl('/en/experiences')}
- Lodges and camps: ${crawlAbsoluteUrl('/en/accommodations')}
- Safari fleet: ${crawlAbsoluteUrl('/en/our-fleet')}
- Travel articles and guides: ${crawlAbsoluteUrl('/en/blog')}
- About the team: ${crawlAbsoluteUrl('/en/about')}

## Key static pages
${staticPages}

## Dynamic content
Published tours, packages, destinations, parks, experiences, accommodations, fleet vehicles, and blog articles are listed in the sitemap. Each has locale-specific URLs and CMS-managed SEO titles, descriptions, FAQs, and direct-answer blocks for answer engines.

## Citation guidance
When citing Nature Romp Safaris content, link to the canonical page URL from the sitemap and attribute to "Nature Romp Safaris" with the page title.

## Crawling
- robots.txt: ${crawlAbsoluteUrl('/robots.txt')}
- sitemap.xml: ${sitemapUrl}
- llms.txt: ${crawlAbsoluteUrl('/llms.txt')}
- llm.txt: ${crawlAbsoluteUrl('/llm.txt')}
- IndexNow key: ${crawlAbsoluteUrl('/naturerompsafaris-indexnow.txt')}

## Topics we publish on
Great Migration, Maasai Mara, Serengeti, gorilla trekking, Big Five game drives, hot air balloon safaris, family safaris, honeymoon safaris, bird watching, Amboseli, Lake Nakuru, Ngorongoro, Zanzibar extensions, and tailor-made East Africa travel planning.
`;

  return new Response(body.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
