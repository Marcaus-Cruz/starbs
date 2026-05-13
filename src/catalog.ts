import type { Size } from './types';

export const sizes = ['short', 'tall', 'grande', 'venti', 'trenta'] as const satisfies readonly Size[];

export const drinks = ['Latte', 'Mocha', 'Americano', 'Brown Sugar Oatmilk Shaken Espresso', 'Caramel Macchiato', 'Caramel Ribbon Crunch Frappuccino', 'Chai Latte', 'Cortado', 'Flat White', 'Honey Citrus Mint Tea', 'Iced Shaken Espresso', 'Mango Dragonfruit Refresher', 'Mango Dragonfruit Energy Refresher', 'Mango Strawberry Refresher', 'Mango Strawberry Energy Refresher', 'Matcha Latte', 'Mocha Cookie Crunch Frappuccino', 'Strawberry Acai Refresher', 'Strawberry Acai Energy Refresher'] as const;
export type Drink = (typeof drinks)[number];

export const milks = [
  '2%',
  'Whole',
  'Nonfat',
  'Oatmilk',
  'Almond',
  'Soymilk',
  'Coconut',
  'Half & Half',
  'Heavy Cream',
  'Protein Milk',
] as const;
export type Milk = (typeof milks)[number];

export const modifiers = [
  'Vanilla Syrup',
  'Sugar-Free Vanilla Syrup',
  'Caramel Syrup',
  'Hazelnut Syrup',
  'Brown Sugar Syrup',
  'Mocha Sauce',
  'White Mocha Sauce',
  'Toasted Coconut Syrup',
  'Dark Caramel',
  'Mango Syrup',
  'Green Tea Extract',
  'Frap Roast',
  'Frap Base',
  'Strawberry Inclusions',
  'Dragonfruit Inclusions',
  'Cookie Crunch',
] as const;
export type Modifier = (typeof modifiers)[number];
