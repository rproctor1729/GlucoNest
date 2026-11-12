export type StoreCategoryId =
  | 'insulin-storage'
  | 'glucose-monitoring'
  | 'insulin-delivery'
  | 'everyday-essentials'
  | 'lifestyle';

export interface StoreCategory {
  id: StoreCategoryId;
  label: string;
  description: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  brand: string;
  category: StoreCategoryId;
  description: string;
  keyFeatures: string[];
  useCases: string[];
  limitations: string[];
  /** Optional verified manufacturer or retailer page. When absent, a neutral search link is shown. */
  buyUrl?: string;
  /** Search text used for the neutral "Where to Buy" link. */
  searchTerm: string;
  featured?: boolean;
}
