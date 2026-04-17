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

-- Steps
INSERT INTO drink_steps (drink_id, step_number, instruction)
SELECT d.id, s.step_number, s.instruction
FROM drinks d
CROSS JOIN (VALUES
  (1, 'Pull the required espresso shots into the cup.'),
  (2, 'If iced, fill cup with ice; if hot, steam milk to 150°F.'),
  (3, 'Pour milk over the espresso.'),
  (4, 'Cap, sleeve, and serve.')
) AS s(step_number, instruction)
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
