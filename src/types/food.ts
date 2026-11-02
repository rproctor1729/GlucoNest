export type FoodCategory =
  | 'Breakfast'
  | 'Breads & Rotis'
  | 'Rice & Biryani'
  | 'Dals & Curries'
  | 'Snacks & Street Food'
  | 'Fruits'
  | 'Beverages & Dairy';

export interface IndianFoodItem {
  id: string;
  name: string;
  regionalName?: string;
  hindiName?: string;
  category: FoodCategory;
  servingDescription: string;
  servingWeightGrams: number;
  carbsGrams: number;
  proteinGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
  glycemicIndexImpact?: 'Low' | 'Medium' | 'High' | 'Delayed (High Fat)';
  t1dTip?: string;
  sourceOrVerification: string; // e.g. "IFCT (NIN Hyderabad) / Clinical T1D Dietary Tables"
}
