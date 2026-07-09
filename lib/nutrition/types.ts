export interface MealItem {
  foodName: string;
  amountG: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
export interface Meal {
  mealType: string;
  name: string;
  items: MealItem[];
}
export interface PlanDay {
  dayLabel: string;
  meals: Meal[];
  tips: string[];
}
