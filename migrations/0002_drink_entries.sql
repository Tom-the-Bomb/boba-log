-- Per-drink entries replace per-day counts.
--
-- `day` is the calendar date the drink belongs to (YYYY-MM-DD), chosen by the
-- client in the user's local time zone. Legacy counts were keyed by UTC
-- midnight, so each one keeps the UTC date it was recorded under.
CREATE TABLE IF NOT EXISTS drinks (
  id INTEGER PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  name TEXT,
  price_cents INTEGER,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_drinks_shop_day ON drinks(shop_id, day);

-- Expand every (shop, day, count) row into `count` individual entries.
INSERT INTO drinks (shop_id, day, created_at)
WITH RECURSIVE expanded(shop_id, date_key, remaining) AS (
  SELECT shop_id, date_key, count FROM shop_dates WHERE count > 0
  UNION ALL
  SELECT shop_id, date_key, remaining - 1 FROM expanded WHERE remaining > 1
)
SELECT shop_id, date(date_key, 'unixepoch'), date_key FROM expanded;

ALTER TABLE users ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';

-- Session tokens issued before this time (epoch seconds) are rejected. Bumped
-- on password change so other devices are signed out.
ALTER TABLE users ADD COLUMN sessions_valid_after INTEGER NOT NULL DEFAULT 0;

-- shop_dates and shops.total are no longer read or written. They stay until a
-- later migration drops them, so the previous release keeps working while this
-- one rolls out.
