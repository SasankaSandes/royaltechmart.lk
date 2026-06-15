import raw from './cities.json';

export interface City {
  code: string;
  city: string;
}

/** Sri Lanka postal areas, sorted by postal code. */
export const CITIES: City[] = (raw as City[])
  .slice()
  .sort((a, b) => a.code.localeCompare(b.code));

/** Display label, e.g. "Colombo 02 (00200)". */
export const cityLabel = (c: City) => `${c.city} (${c.code})`;
