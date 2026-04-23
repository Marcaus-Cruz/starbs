// AUTO-GENERATED from db/drinks/*.json by scripts/build-drinks.ts
// Do not edit by hand. Regenerate with: npm run db:build

export interface DrinkCatalogEntry {
  name: string;
  defaultMilk: string | null;
  defaultIced: boolean;
  hasHot: boolean;
  hasIced: boolean;
}

export const drinkCatalog: readonly DrinkCatalogEntry[] = [
  {
    name: "Americano",
    defaultMilk: null,
    defaultIced: false,
    hasHot: true,
    hasIced: true,
  },
  {
    name: "Brown Sugar Oatmilk Shaken Espresso",
    defaultMilk: "Oat",
    defaultIced: true,
    hasHot: false,
    hasIced: true,
  },
  {
    name: "Caramel Macchiato",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
  },
  {
    name: "Chai Latte",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
  },
  {
    name: "Example Drink",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
  },
  {
    name: "Latte",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
  },
  {
    name: "Mocha",
    defaultMilk: "2%",
    defaultIced: false,
    hasHot: true,
    hasIced: true,
  },
] as const;
