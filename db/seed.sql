-- Seed: milks, a latte, and a vanilla syrup modifier.
-- Recipes use ingredient='milk' with no quantity — the actual milk type is
-- chosen at order time from the `milks` table, and "how much" is governed
-- by the step text ("pour to the {size} line"), not a number.

-- Milks (heavy cream lumped in per real POS behavior). 2% is marked as the
-- default; drink-specific defaults can override in the POS layer.
INSERT INTO milks (name, is_default) VALUES
  ('2%',          TRUE),
  ('Whole',       FALSE),
  ('Nonfat',      FALSE),
  ('Oat',         FALSE),
  ('Almond',      FALSE),
  ('Soy',         FALSE),
  ('Coconut',     FALSE),
  ('Half & Half', FALSE),
  ('Heavy Cream', FALSE),
  ('Protein',     FALSE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO drinks (name, category) VALUES
  ('Latte', 'espresso')
ON CONFLICT (name) DO NOTHING;

-- Hot latte recipes: espresso (measured) + milk (type picked at order time)
INSERT INTO drink_recipes (drink_id, size, iced, ingredient, quantity, unit)
SELECT d.id, v.size, FALSE, 'espresso', v.shots, 'shots'
FROM drinks d
CROSS JOIN (VALUES
  ('short',  1),
  ('tall',   1),
  ('grande', 2),
  ('venti',  2)
) AS v(size, shots)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

INSERT INTO drink_recipes (drink_id, size, iced, ingredient, quantity, unit)
SELECT d.id, v.size, FALSE, 'milk', NULL, NULL
FROM drinks d
CROSS JOIN (VALUES ('short'), ('tall'), ('grande'), ('venti')) AS v(size)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Iced latte recipes (no iced short): espresso + milk + ice
INSERT INTO drink_recipes (drink_id, size, iced, ingredient, quantity, unit)
SELECT d.id, v.size, TRUE, 'espresso', v.shots, 'shots'
FROM drinks d
CROSS JOIN (VALUES
  ('tall',   1),
  ('grande', 2),
  ('venti',  3)
) AS v(size, shots)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

INSERT INTO drink_recipes (drink_id, size, iced, ingredient, quantity, unit)
SELECT d.id, v.size, TRUE, ing, NULL, NULL
FROM drinks d
CROSS JOIN (VALUES ('tall'), ('grande'), ('venti')) AS v(size)
CROSS JOIN (VALUES ('milk'), ('ice')) AS i(ing)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Hot latte steps. Placeholders: {shots}, {pumps}, {size}, {flavor}, {milk}
INSERT INTO drink_steps (drink_id, iced, step_number, template, applies_when)
SELECT d.id, FALSE, s.step_number, s.template, s.applies_when
FROM drinks d
CROSS JOIN (VALUES
  (1.0, 'Pull {shots} shots of espresso',                       NULL),
  (1.5, 'Add {pumps} pumps of {flavor} to the cup',             'has_modifier'),
  (2.0, 'Pour shots over the {flavor}',                         'has_modifier'),
  (2.0, 'Pour shots into the cup',                              'no_modifier'),
  (3.0, 'Pour {milk} to the {size} line of the steaming pitcher', NULL),
  (4.0, 'Steam the {milk}',                                     NULL),
  (5.0, 'Pour steamed {milk} onto the espresso',                NULL),
  (6.0, 'Purge and wipe the steam wand',                        NULL),
  (7.0, 'Cap, sleeve, and serve',                               NULL)
) AS s(step_number, template, applies_when)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Iced latte steps.
INSERT INTO drink_steps (drink_id, iced, step_number, template, applies_when)
SELECT d.id, TRUE, s.step_number, s.template, s.applies_when
FROM drinks d
CROSS JOIN (VALUES
  (1.0, 'Pull {shots} shots of espresso',                 NULL),
  (1.5, 'Add {pumps} pumps of {flavor} to the cup',       'has_modifier'),
  (2.0, 'Pour shots over the {flavor}',                   'has_modifier'),
  (2.0, 'Pour shots into the cup',                        'no_modifier'),
  (3.0, 'Top the cup with ice',                           NULL),
  (4.0, 'Pour {milk} over the ice to the top',            NULL),
  (5.0, 'Cap and serve',                                  NULL)
) AS s(step_number, template, applies_when)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Modifiers. All standard syrups/sauces use the same per-size pump counts:
-- short=2, tall=3, grande=4, venti=5. Keep them insertable from one query.
INSERT INTO modifiers (name) VALUES
  ('Vanilla Syrup'),
  ('Sugar-Free Vanilla Syrup'),
  ('Caramel Syrup'),
  ('Hazelnut Syrup'),
  ('Brown Sugar Syrup'),
  ('Mocha Sauce'),
  ('White Mocha Sauce'),
  ('Toasted Coconut Syrup')
ON CONFLICT (name) DO NOTHING;

INSERT INTO modifier_recipes (modifier_id, size, quantity, unit)
SELECT m.id, v.size, v.pumps, 'pumps'
FROM modifiers m
CROSS JOIN (VALUES
  ('short',  2),
  ('tall',   3),
  ('grande', 4),
  ('venti',  5)
) AS v(size, pumps)
ON CONFLICT DO NOTHING;
