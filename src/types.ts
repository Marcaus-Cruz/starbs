export type Size = 'short' | 'tall' | 'grande' | 'venti' | 'trenta';

export type IngredientMap = Record<string, { quantity: number; unit: string }>;

export interface ResolvedOrder {
  id: number;
  name: string;
  category: string | null;
  size: Size;
  iced: boolean;
  ingredients: IngredientMap;
  modifiers: { id: number; name: string; quantity: number; unit: string }[];
  steps: { stepNumber: number; text: string }[];
}

export interface OrderSelection {
  drinkId: number;
  drinkName: string;
  size: Size;
  iced: boolean;
  modifierIds: number[];
}
