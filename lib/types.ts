export type Category = 'earbuds' | 'chargers' | 'powerbanks' | 'holders' | 'cables';
export type Badge = 'Trending' | 'Featured' | 'New';
export type StockStatus = 'in' | 'low' | 'out';

export interface Product {
  id: number;
  name: string;
  slug?: string;
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
  image?: string;
}

export interface CategoryInfo {
  id: Category;
  label: string;
  blurb: string;
}

export type SortKey = 'popular' | 'new' | 'low' | 'high' | 'rating';

export type AdminRole = 'owner' | 'staff';

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  role: AdminRole;
  createdAt: Date;
}

export interface Banner {
  id: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaUrl: string;
  bgFrom: string;
  bgTo: string;
  active: boolean;
  sortOrder: number;
}
