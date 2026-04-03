// Core rotation spells and Hero Talent tree spells for Fire Mage
export const FIRE_MAGE_SPELL_IDS = {
  // Core rotation
  FIREBALL: '133',
  PYROBLAST: '11366',
  FIRE_BLAST: '108853',
  PHOENIX_FLAMES: '257541',
  SCORCH: '2948',
  FLAMESTRIKE: '2120',
  COMBUSTION: '190319',

  // Buffs / procs
  HEATING_UP: '48107',
  HOT_STREAK: '48108',
  COMBUSTION_BUFF: '190319',

  // Sunfury tree
  ARCANE_SOUL: '448688',
  PHOENIX_REBORN: '453208',
  GLEAMING_CINDERS: '453207',

  // Spellslinger tree
  SPELLFROST_TEACHINGS: '453431',
  SPELLFROST_BOLT: '453436',
  SLIPSTREAM: '236457',
} as const

// Cooldown durations in milliseconds for charge-based and major cooldown spells
export const FIRE_MAGE_COOLDOWNS = {
  FIRE_BLAST_MS: 12000,
  PHOENIX_FLAMES_MS: 30000,
  COMBUSTION_MS: 120000,
} as const

// Maximum charges available per spell at full talent investment
export const FIRE_MAGE_MAX_CHARGES = {
  FIRE_BLAST: 3,
  PHOENIX_FLAMES: 3,
} as const
