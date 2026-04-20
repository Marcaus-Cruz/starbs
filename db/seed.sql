-- Seed: Latte, with sizing rules for iced/hot, plus a vanilla syrup modifier.
-- Hot latte shots:   short=1, tall=1, grande=2, venti=2
-- Iced latte shots:  tall=1, grande=2, venti=3  (no iced short)
-- Vanilla syrup pumps (modifier): tall=3, grande=4, venti=5

INSERT INTO drinks (name, category) VALUES
  ('Latte', 'espresso')
ON CONFLICT (name) DO NOTHING;

-- Hot latte recipes
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
SELECT d.id, v.size, FALSE, 'steamed milk', v.oz, 'oz'
FROM drinks d
CROSS JOIN (VALUES
  ('short',  7),
  ('tall',   11),
  ('grande', 14),
  ('venti',  18)
) AS v(size, oz)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Iced latte recipes (no iced short)
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
SELECT d.id, v.size, TRUE, 'cold milk', v.oz, 'oz'
FROM drinks d
CROSS JOIN (VALUES
  ('tall',   10),
  ('grande', 13),
  ('venti',  18)
) AS v(size, oz)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

INSERT INTO drink_recipes (drink_id, size, iced, ingredient, quantity, unit)
SELECT d.id, v.size, TRUE, 'ice', v.scoops, 'scoops'
FROM drinks d
CROSS JOIN (VALUES
  ('tall',   1),
  ('grande', 1),
  ('venti',  2)
) AS v(size, scoops)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Hot latte steps. Placeholders: {shots}, {pumps}, {size}, {flavor}
-- Step 2 has two variants — one for flavored orders, one for plain — so the
-- final text changes based on whether a modifier is attached.
INSERT INTO drink_steps (drink_id, iced, step_number, template, applies_when)
SELECT d.id, FALSE, s.step_number, s.template, s.applies_when
FROM drinks d
CROSS JOIN (VALUES
  (1.0, 'Pull {shots} shots of espresso',                     NULL),
  (1.5, 'Add {pumps} pumps of {flavor} to the cup',           'has_modifier'),
  (2.0, 'Pour shots over the {flavor}',                       'has_modifier'),
  (2.0, 'Pour shots into the cup',                            'no_modifier'),
  (3.0, 'Pour milk to the {size} line of the steaming pitcher', NULL),
  (4.0, 'Steam the milk',                                     NULL),
  (5.0, 'Pour steamed milk onto the espresso',                NULL),
  (6.0, 'Purge and wipe the steam wand',                      NULL),
  (7.0, 'Cap, sleeve, and serve',                             NULL)
) AS s(step_number, template, applies_when)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Iced latte steps. Different flow: ice goes in the cup, cold milk is poured
-- straight (no steaming), no pitcher.
INSERT INTO drink_steps (drink_id, iced, step_number, template, applies_when)
SELECT d.id, TRUE, s.step_number, s.template, s.applies_when
FROM drinks d
CROSS JOIN (VALUES
  (1.0, 'Pull {shots} shots of espresso',                     NULL),
  (1.5, 'Add {pumps} pumps of {flavor} to the cup',           'has_modifier'),
  (2.0, 'Pour shots over the {flavor}',                       'has_modifier'),
  (2.0, 'Pour shots into the cup',                            'no_modifier'),
  (3.0, 'Fill the cup with ice',                              NULL),
  (4.0, 'Pour cold milk over the ice to the top',             NULL),
  (5.0, 'Cap and serve',                                      NULL)
) AS s(step_number, template, applies_when)
WHERE d.name = 'Latte'
ON CONFLICT DO NOTHING;

-- Vanilla syrup modifier
INSERT INTO modifiers (name) VALUES ('Vanilla Syrup')
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
WHERE m.name = 'Vanilla Syrup'
ON CONFLICT DO NOTHING;
