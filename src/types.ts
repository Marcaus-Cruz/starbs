export type Size = 'short' | 'tall' | 'grande' | 'venti';

export type IngredientMap = Record<string, { quantity: number; unit: string }>;

export interface DrinkVariant {
  size: Size;
  iced: boolean;
  ingredients: IngredientMap;
}

export interface Drink {
  id: number;
  name: string;
  category: string | null;
  variants: DrinkVariant[];
  steps: { stepNumber: number; instruction: string }[];
}

export interface OrderSelection {
  drinkId: number;
  drinkName: string;
  size: Size;
  iced: boolean;
  modifierIds: number[];
}
