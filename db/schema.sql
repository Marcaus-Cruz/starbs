-- starbs schema
-- Normalized relational model. Drinks have many recipe rows (one per
-- size/iced/ingredient combo) and many ordered steps. Modifiers live in
-- their own tables so they can attach to any drink at order time.

CREATE TABLE IF NOT EXISTS drinks (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  category   TEXT
);

-- quantity/unit are NULL for ingredients that aren't measured (e.g. milk
-- poured "to the line", ice "to the top"). They're kept for ingredients
-- that have a real measurement (shots, pumps).
CREATE TABLE IF NOT EXISTS drink_recipes (
  id          SERIAL PRIMARY KEY,
  drink_id    INT NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  size        TEXT NOT NULL CHECK (size IN ('short','tall','grande','venti','trenta')),
  iced        BOOLEAN NOT NULL,
  ingredient  TEXT NOT NULL,
  quantity    NUMERIC,
  unit        TEXT,
  UNIQUE (drink_id, size, iced, ingredient)
);

CREATE INDEX IF NOT EXISTS idx_drink_recipes_drink ON drink_recipes(drink_id);

-- Steps are per drink AND per iced/hot. Hot and iced are effectively
-- different instruction sets (different pitcher handling, ice, etc.).
-- `template` is a string with placeholders like {shots}, {pumps}, {size},
-- {flavor}; the API layer substitutes values from the order's recipe rows
-- and modifiers. `applies_when` lets a row be conditional:
--   NULL            always render
--   'has_modifier'  only render if the order has >= 1 modifier
--   'no_modifier'   only render if the order has 0 modifiers
-- step_number is NUMERIC so you can insert 1.5 between 1 and 2 for
-- conditional "insert" steps.
CREATE TABLE IF NOT EXISTS drink_steps (
  id            SERIAL PRIMARY KEY,
  drink_id      INT NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  iced          BOOLEAN NOT NULL,
  step_number   NUMERIC NOT NULL,
  template      TEXT NOT NULL,
  applies_when  TEXT CHECK (applies_when IN ('has_modifier','no_modifier')),
  UNIQUE (drink_id, iced, step_number, applies_when)
);

CREATE INDEX IF NOT EXISTS idx_drink_steps_drink ON drink_steps(drink_id, iced, step_number);

-- Available milks. `is_default` flags which one is pre-selected in the POS
-- for drinks whose default is this milk. Multiple milks can have
-- is_default=true since different drink categories default to different
-- milks (latte/mocha default to 2%, but e.g. breve defaults to half & half).
-- The drink-specific default is enforced in the POS layer, not here.
CREATE TABLE IF NOT EXISTS milks (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS modifiers (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

-- Per-size quantities for a modifier (e.g. vanilla syrup: tall=3, grande=4, venti=5 pumps)
CREATE TABLE IF NOT EXISTS modifier_recipes (
  id           SERIAL PRIMARY KEY,
  modifier_id  INT NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  size         TEXT NOT NULL CHECK (size IN ('short','tall','grande','venti','trenta')),
  quantity     NUMERIC NOT NULL,
  unit         TEXT NOT NULL,
  UNIQUE (modifier_id, size)
);
