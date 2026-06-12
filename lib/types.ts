export type Category = 'earbuds' | 'chargers' | 'powerbanks' | 'holders' | 'cables';
export type Badge = 'Trending' | 'Featured' | 'New';
export type StockStatus = 'in' | 'low' | 'out';

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number;
  badge?: Badge;
  rating: number;
  reviews: number;
  stock: StockStatus;
  warranty: string;
  short: string;
  tone: [string, string];
  specs: [string, string][];
  image?: string; // /products/<id>.jpg once imported
  slug?: string;  // URL-friendly name, auto-derived if absent
}

export interface CategoryInfo {
  id: Category;
  label: string;
  blurb: string;
}

export type SortKey = 'popular' | 'new' | 'low' | 'high' | 'rating';
