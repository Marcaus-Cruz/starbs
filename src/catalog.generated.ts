// AUTO-GENERATED from db/drinks/*.json by scripts/build-drinks.ts
// Do not edit by hand. Regenerate with: npm run db:build

export interface DrinkCatalogEntry {
  name: string;
  defaultMilk: string | null;
  defaultIced: boolean;
  hasHot: boolean;
  hasIced: boolean;
  recipeIngredients: readonly string[];
}

export const drinkCatalog: readonly DrinkCatalogEntry[] = [
  {
    name: "Americano",
    defaultMilk: null,
    defaultIced: false,
    hasHot: true,
    hasIced: true,
    recipeIngredients: ["espresso"],
  },
  {
    name: "Brown Sugar Oatmilk Shaken Espresso",
    defaultMilk: "Oatmilk",
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["cinnamon powder","classic syrup","espresso"],
  },
  {
    name: "Caramel Macchiato",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
    recipeIngredients: ["caramel drizzle","espresso","vanilla syrup"],
  },
  {
    name: "Chai Latte",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
    recipeIngredients: ["chai syrup","classic syrup"],
  },
  {
    name: "Cortado",
    defaultMilk: "Whole",
    defaultIced: false,
    hasHot: true,
    hasIced: false,
    recipeIngredients: ["ristretto"],
  },
  {
    name: "Example Drink",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
    recipeIngredients: ["espresso","mocha sauce"],
  },
  {
    name: "Flat White",
    defaultMilk: "Whole",
    defaultIced: false,
    hasHot: true,
    hasIced: false,
    recipeIngredients: ["ristretto"],
  },
  {
    name: "Honey Citrus Mint Tea",
    defaultMilk: null,
    defaultIced: false,
    hasHot: true,
    hasIced: false,
    recipeIngredients: ["honey blend","mint majesty tea bag"],
  },
  {
    name: "Iced Shaken Espresso",
    defaultMilk: "2%",
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["classic syrup","espresso"],
  },
  {
    name: "Latte",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
    recipeIngredients: ["espresso"],
  },
  {
    name: "Mango Dragonfruit Energy Refresher",
    defaultMilk: null,
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["dragonfruit inclusions","green tea extract"],
  },
  {
    name: "Mango Dragonfruit Refresher",
    defaultMilk: null,
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["dragonfruit inclusions","green tea extract"],
  },
  {
    name: "Mango Strawberry Energy Refresher",
    defaultMilk: null,
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["green tea extract","mango syrup","strawberry inclusions"],
  },
  {
    name: "Mango Strawberry Refresher",
    defaultMilk: null,
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["green tea extract","mango syrup","strawberry inclusions"],
  },
  {
    name: "Matcha Latte",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
    recipeIngredients: ["matcha powder"],
  },
  {
    name: "Mocha",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
    recipeIngredients: ["espresso","mocha sauce"],
  },
  {
    name: "Mocha Cookie Crunch Frappuccino",
    defaultMilk: "Whole",
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["choco chips","frap base","frap roast"],
  },
  {
    name: "Strawberry Acai Energy Refresher",
    defaultMilk: null,
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["green tea extract","strawberry inclusions"],
  },
  {
    name: "Strawberry Acai Refresher",
    defaultMilk: null,
    defaultIced: true,
    hasHot: false,
    hasIced: true,
    recipeIngredients: ["green tea extract","strawberry inclusions"],
  },
] as const;
