// ─── Spec ID map ──────────────────────────────────────────────────────────────

export const WOW_SPEC_IDS: Record<string, number[]> = {
  'mage-fire': [63],
  'mage-frost': [64],
  'mage-arcane': [62],
  'warlock-affliction': [265],
  'warlock-demonology': [266],
  'warlock-destruction': [267],
  'paladin-holy': [65],
  'paladin-protection': [66],
  'paladin-retribution': [70],
  'hunter-beastmastery': [253],
  'hunter-marksmanship': [254],
  'hunter-survival': [255],
  'warrior-arms': [71],
  'warrior-fury': [72],
  'warrior-protection': [73],
  'deathknight-blood': [250],
  'deathknight-frost': [251],
  'deathknight-unholy': [252],
  'druid-balance': [102],
  'druid-feral': [103],
  'druid-guardian': [104],
  'druid-restoration': [105],
  'rogue-assassination': [259],
  'rogue-outlaw': [260],
  'rogue-subtlety': [261],
  'priest-discipline': [256],
  'priest-holy': [257],
  'priest-shadow': [258],
  'shaman-elemental': [262],
  'shaman-enhancement': [263],
  'shaman-restoration': [264],
  'monk-brewmaster': [268],
  'monk-mistweaver': [270],
  'monk-windwalker': [269],
  'demonhunter-havoc': [577],
  'demonhunter-vengeance': [581],
  'demonhunter-devourer': [1473],
  'evoker-devastation': [1467],
  'evoker-preservation': [1468],
  'evoker-augmentation': [1473],
}

// ─── Class subtype map ────────────────────────────────────────────────────────

export const WCL_SUBTYPE_MAP: Record<string, string> = {
  deathknight: 'DeathKnight',
  demonhunter: 'DemonHunter',
  mage: 'Mage',
  warrior: 'Warrior',
  paladin: 'Paladin',
  hunter: 'Hunter',
  rogue: 'Rogue',
  priest: 'Priest',
  shaman: 'Shaman',
  monk: 'Monk',
  druid: 'Druid',
  warlock: 'Warlock',
  evoker: 'Evoker',
}

// ─── Fight context detection ──────────────────────────────────────────────────

export const RAID_BOSSES = [
  'Imperator Averzian',
  'Fallen-King Salhadaar',
  'Vorasius',
  'Chimaerus',
  'Vaelgor',
  'Ezzorak',
  'Bloodseeker Karion',
  'Voidlight Everdawn',
] as const

/** Spell IDs that indicate multi-target AoE casts (Blizzard, Flurry). */
export const AOE_INDICATORS = new Set(['190356', '44614'])
