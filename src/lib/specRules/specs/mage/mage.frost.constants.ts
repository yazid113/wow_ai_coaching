// ─── Core Rotation Spells ────────────────────────────────────────────────────

export const FROST_MAGE_SPELL_IDS = {
  // Core rotation
  FROSTBOLT: '116',
  FROSTFIRE_BOLT: '431044',
  FLURRY: '44614',
  ICE_LANCE: '30455',
  FROZEN_ORB: '84714',
  BLIZZARD: '190356',
  GLACIAL_SPIKE: '199786',
  ICY_VEINS: '12472',
  COMET_STORM: '153595',
  COLD_SNAP: '235219',
  SHIFTING_POWER: '382440',

  // Buffs / procs
  BRAIN_FREEZE: '190446',
  FINGERS_OF_FROST: '44544',
  WINTERS_CHILL: '228358',
  ICY_VEINS_BUFF: '12472',
  GLACIAL_SPIKE_BUFF: '199786',
  FROZEN_ORB_BUFF: '84714',

  // Frostfire tree
  FROSTFIRE_EMPOWERMENT: '431176',
  EXCESS_FROST: '438568',
  EXCESS_FIRE: '438569',

  // Spellfrost tree
  SPELLFROST_TEACHINGS: '453431',
  SPELLFROST_BOLT: '453436',
} as const

// ─── Cooldown Durations (ms) ─────────────────────────────────────────────────

export const FROST_MAGE_COOLDOWNS = {
  ICY_VEINS_MS: 120_000,
  FROZEN_ORB_MS: 60_000,
  COMET_STORM_MS: 30_000,
} as const
