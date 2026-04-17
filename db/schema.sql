-- starbs schema
-- Normalized relational model. Drinks have many recipe rows (one per
-- size/iced/ingredient combo) and many ordered steps. Modifiers live in
-- their own tables so they can attach to any drink at order time.

CREATE TABLE IF NOT EXISTS drinks (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  category   TEXT
);

CREATE TABLE IF NOT EXISTS drink_recipes (
  id          SERIAL PRIMARY KEY,
  drink_id    INT NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  size        TEXT NOT NULL CHECK (size IN ('short','tall','grande','venti')),
  iced        BOOLEAN NOT NULL,
  ingredient  TEXT NOT NULL,
  quantity    NUMERIC NOT NULL,
  unit        TEXT NOT NULL,
  UNIQUE (drink_id, size, iced, ingredient)
);

CREATE INDEX IF NOT EXISTS idx_drink_recipes_drink ON drink_recipes(drink_id);

CREATE TABLE IF NOT EXISTS drink_steps (
  id           SERIAL PRIMARY KEY,
  drink_id     INT NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  step_number  INT NOT NULL,
  instruction  TEXT NOT NULL,
  UNIQUE (drink_id, step_number)
);

CREATE TABLE IF NOT EXISTS modifiers (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

-- Per-size quantities for a modifier (e.g. vanilla syrup: tall=3, grande=4, venti=5 pumps)
CREATE TABLE IF NOT EXISTS modifier_recipes (
  id           SERIAL PRIMARY KEY,
  modifier_id  INT NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  size         TEXT NOT NULL CHECK (size IN ('short','tall','grande','venti')),
  quantity     NUMERIC NOT NULL,
  unit         TEXT NOT NULL,
  UNIQUE (modifier_id, size)
);
