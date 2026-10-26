/** Public safari collections. `combined` is every trip that visits both Kenya and Tanzania. */
export const PUBLIC_TOUR_COLLECTIONS = [
  { id: 'kenya-lodges', label: 'Kenya lodge safaris', menu: 'kenya' },
  { id: 'mount-kenya', label: 'Mount Kenya', menu: 'kenya' },
  {
    id: 'day-trips',
    label: 'Day trips',
    menu: 'kenya',
    navPath: '/tours?collection=day-trips&country=kenya'
  },
  { id: 'kenya-group-joining', label: 'Kenya group joining', menu: 'kenya' },
  { id: 'tanzania-lodges', label: 'Tanzania lodge safaris', menu: 'tanzania' },
  { id: 'kilimanjaro', label: 'Kilimanjaro', menu: 'tanzania' },
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
};

export function tourMatchesCollection(tour: CollectionTour, collectionId: string): boolean {
  if (collectionId === 'day-trips') return tour.days === 1;
  if (collectionId === 'combined') {
    const countries = tour.countryIds ?? [];
    return countries.includes('kenya') && countries.includes('tanzania');
  }
  return tour.catalogGroup === collectionId;
}
