-- Spell data cached from the Blizzard Game Data API.
-- Per Blizzard API Terms of Service, cached data must not be retained
-- beyond 30 days. The expires_at column tracks this TTL and rows are
-- purged periodically by cleanExpiredSpells() in spellSyncService.ts.

CREATE TABLE spells (
  spell_id    integer      PRIMARY KEY,
  name        text         NOT NULL,
  description text,
  icon_url    text,
  synced_at   timestamptz  NOT NULL DEFAULT now(),
  expires_at  timestamptz  NOT NULL
);

COMMENT ON TABLE spells IS
  'Blizzard spell data cache. Rows expire after 30 days per Blizzard API ToS.';

-- Used by cleanExpiredSpells() to efficiently find and delete expired rows.
CREATE INDEX spells_expires_at_idx ON spells (expires_at);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE spells ENABLE ROW LEVEL SECURITY;

-- Public read access — spell data is non-sensitive game metadata.
CREATE POLICY "spells_select_public"
  ON spells
  FOR SELECT
  TO public
  USING (true);

-- No authenticated user may write spell rows directly.
-- Writes are performed exclusively by the service role via spellSyncService.ts.
CREATE POLICY "spells_insert_denied"
  ON spells
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "spells_update_denied"
  ON spells
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "spells_delete_denied"
  ON spells
  FOR DELETE
  TO authenticated
  USING (false);
