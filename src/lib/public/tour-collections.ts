/** Public safari collections. `combined` is every trip that visits both Kenya and Tanzania. */
export const PUBLIC_TOUR_COLLECTIONS = [
  { id: 'kenya-lodges', label: 'Kenya lodge safaris', menu: 'kenya' },
  { id: 'kenya-mountain-climbing', label: 'Kenya Mountain Climbing', menu: 'kenya' },
  {
    id: 'day-trips',
    label: 'Day trips',
    menu: 'kenya',
    navPath: '/tours?collection=day-trips&country=kenya'
  },
  { id: 'kenya-group-joining', label: 'Kenya group joining', menu: 'kenya' },
  { id: 'tanzania-lodges', label: 'Tanzania lodge safaris', menu: 'tanzania' },
  { id: 'tanzania-mountain-climbing', label: 'Tanzania Mountain Climbing', menu: 'tanzania' },
  { id: 'combined', label: 'Combined Kenya and Tanzania safaris', menu: 'combined' },
  { id: 'kenya-tanzania-lodges', label: 'Kenya and Tanzania lodges', menu: 'combined' },
  {
    id: 'kenya-tanzania-group-joining',
    label: 'Kenya and Tanzania group joining',
    menu: 'combined'
  }
] as const;

export type PublicTourCollectionId = (typeof PUBLIC_TOUR_COLLECTIONS)[number]['id'];
export type PublicTourCollectionMenu = (typeof PUBLIC_TOUR_COLLECTIONS)[number]['menu'];

const COLLECTION_IDS = new Set<string>(PUBLIC_TOUR_COLLECTIONS.map((item) => item.id));

export function isPublicTourCollectionId(value: string): value is PublicTourCollectionId {
  return COLLECTION_IDS.has(value);
}

export function publicTourCollectionLabel(id: string | null | undefined): string {
  return PUBLIC_TOUR_COLLECTIONS.find((item) => item.id === id)?.label ?? '';
}

export function publicTourCollectionsForMenu(menu: PublicTourCollectionMenu) {
  return PUBLIC_TOUR_COLLECTIONS.filter((item) => item.menu === menu);
}

type CollectionTour = {
  catalogGroup?: string | null;
  countryIds?: readonly string[];
  days?: number | null;
  experienceLabels?: readonly string[];
};

const MOUNTAIN_CLIMBING_EXPERIENCE = 'mountain climbing';

function tourHasCountry(tour: CollectionTour, slug: string): boolean {
  return (tour.countryIds ?? []).includes(slug);
}

function tourIsMountainClimbing(tour: CollectionTour): boolean {
  return (tour.experienceLabels ?? []).some(
    (label) => label.trim().toLowerCase() === MOUNTAIN_CLIMBING_EXPERIENCE
  );
}

export function tourMatchesCollection(tour: CollectionTour, collectionId: string): boolean {
  if (collectionId === 'day-trips') return tour.days === 1;
  if (collectionId === 'combined') {
    const countries = tour.countryIds ?? [];
    return countries.includes('kenya') && countries.includes('tanzania');
  }
  // Mountain-climbing collections span every peak in a country (Mt Kenya,
  // Longonot, Kilimanjaro, …), so match by the "Mountain Climbing" experience
  // plus country rather than a single catalog/pricing group.
  if (collectionId === 'kenya-mountain-climbing') {
    return tourHasCountry(tour, 'kenya') && tourIsMountainClimbing(tour);
  }
  if (collectionId === 'tanzania-mountain-climbing') {
    return tourHasCountry(tour, 'tanzania') && tourIsMountainClimbing(tour);
  }
  return tour.catalogGroup === collectionId;
}
