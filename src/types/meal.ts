export interface MealItemSelection {
  foodId: string;
  name: string;
  servings: number;
  servingDescription: string;
  carbsPerServing: number;
  totalCarbs: number;
}

export interface MealLogEntry {
  id: string;
  timestamp: string; // ISO string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'hypo-treatment';
  name: string;
  items: MealItemSelection[];
  totalCarbs: number; // in grams
  notes?: string;
  isDemo?: boolean;
}
