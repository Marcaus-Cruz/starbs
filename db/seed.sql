-- Catalog data only: milks and modifiers. Drink definitions live in
-- db/drinks/*.json and are compiled into db/drinks.generated.sql via
-- `npm run db:build`.

-- Milks (heavy cream lumped in per real POS behavior). 2% is the default;
-- drink-specific defaults can override in the POS layer.
INSERT INTO milks (name, is_default) VALUES
  ('2%',          TRUE),
  ('Whole',       FALSE),
  ('Nonfat',      FALSE),
  ('Oatmilk',         FALSE),
  ('Almond',      FALSE),
  ('Soymilk',         FALSE),
  ('Coconut',     FALSE),
  ('Half & Half', FALSE),
  ('Heavy Cream', FALSE),
  ('Protein milk',     FALSE)
ON CONFLICT (name) DO NOTHING;

-- Modifiers. Standard syrups/sauces share the same per-size pump counts:
-- short=2, tall=3, grande=4, venti=5, trenta=6. Toppings are separate — no pump ladder.
-- Inclusions (frap/refresher add-ins) use scoops, not pumps.
INSERT INTO modifiers (name) VALUES
  ('Vanilla Syrup'),
  ('Sugar-Free Vanilla Syrup'),
  ('Caramel Syrup'),
  ('Hazelnut Syrup'),
  ('Brown Sugar Syrup'),
  ('Mocha Sauce'),
  ('White Mocha Sauce'),
  ('Toasted Coconut Syrup'),
  ('Dark Caramel'),
  ('Mango Syrup'),
  ('Green Tea Extract'),
  ('Frap Roast'),
  ('Frap Base'),
  ('Strawberry Inclusions'),
  ('Dragonfruit Inclusions'),
  ('Cookie Crunch')
ON CONFLICT (name) DO NOTHING;

-- Pumped syrups/sauces: standard 2/3/4/5/6 ladder per size.
INSERT INTO modifier_recipes (modifier_id, size, quantity, unit)
SELECT m.id, v.size, v.pumps, 'pumps'
FROM modifiers m
CROSS JOIN (VALUES
  ('short',  2),
  ('tall',   3),
  ('grande', 4),
  ('venti',  5),
  ('trenta', 6)
) AS v(size, pumps)
WHERE m.name NOT IN ('Cookie Crunch', 'Strawberry Inclusions', 'Dragonfruit Inclusions')
ON CONFLICT DO NOTHING;

-- Inclusions: 1 scoop per size (matches drink-recipe defaults).
INSERT INTO modifier_recipes (modifier_id, size, quantity, unit)
SELECT m.id, v.size, 1, 'scoops'
FROM modifiers m
CROSS JOIN (VALUES
  ('short'), ('tall'), ('grande'), ('venti'), ('trenta')
) AS v(size)
WHERE m.name IN ('Strawberry Inclusions', 'Dragonfruit Inclusions')
ON CONFLICT DO NOTHING;

-- Toppings: one application per drink, regardless of size.
INSERT INTO modifier_recipes (modifier_id, size, quantity, unit)
SELECT m.id, v.size, 1, 'topping'
FROM modifiers m
CROSS JOIN (VALUES
  ('short'), ('tall'), ('grande'), ('venti'), ('trenta')
) AS v(size)
WHERE m.name IN ('Cookie Crunch')
ON CONFLICT DO NOTHING;
