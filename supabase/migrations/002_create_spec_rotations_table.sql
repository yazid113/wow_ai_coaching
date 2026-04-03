-- Parsed SimulationCraft APL data stored as a single jsonb actions array per
-- spec + hero talent tree combination. This is the source of truth for rotation
-- logic — rows are replaced wholesale on each sync via aplSyncService.ts.
-- Not sourced from the Blizzard API, so no TTL applies.

CREATE TABLE spec_rotations (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_key         text         NOT NULL,
  hero_talent_tree text,
  patch_version    text         NOT NULL,
  actions          jsonb        NOT NULL,
  raw_content      text         NOT NULL,
  source_url       text         NOT NULL,
  parsed_at        timestamptz  NOT NULL,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE spec_rotations IS
  'Parsed SimulationCraft APL data — one row per (spec_key, hero_talent_tree) combination. '
  'actions is a jsonb array of AplAction objects ordered by (listName, priority). '
  'Source of truth for rotation logic; updated by aplSyncService.ts on each sync.';

-- ─── Unique Constraints ───────────────────────────────────────────────────────

-- NULLS NOT DISTINCT treats two NULL hero_talent_tree values as equal, so a
-- single constraint correctly enforces one row per (spec_key, base-spec) and
-- one row per (spec_key, named-tree). Requires PostgreSQL 15+.
ALTER TABLE spec_rotations
  ADD CONSTRAINT spec_rotations_spec_tree_key
  UNIQUE NULLS NOT DISTINCT (spec_key, hero_talent_tree);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- Fast single-spec lookup (the primary read pattern).
CREATE INDEX spec_rotations_spec_key_idx
  ON spec_rotations (spec_key);

-- Supports filtering or auditing rows by patch version.
CREATE INDEX spec_rotations_patch_version_idx
  ON spec_rotations (patch_version);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE spec_rotations ENABLE ROW LEVEL SECURITY;

-- Public read access — rotation data is non-sensitive game metadata.
CREATE POLICY "spec_rotations_select_public"
  ON spec_rotations
  FOR SELECT
  TO public
  USING (true);

-- Writes are performed exclusively by the service role via aplSyncService.ts.
CREATE POLICY "spec_rotations_insert_denied"
  ON spec_rotations
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "spec_rotations_update_denied"
  ON spec_rotations
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "spec_rotations_delete_denied"
  ON spec_rotations
  FOR DELETE
  TO authenticated
  USING (false);
