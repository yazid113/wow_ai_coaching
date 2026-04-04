import type { HeroTalentOverlay } from '../../types'

import {
  DEMO_WARLOCK_SPELL_IDS,
  detectDreadstalkersCooldownDelay,
  detectHogLowShards,
  detectMissedInfernalBoltDuringRitual,
  detectTyrantLowDemonCount,
  detectVilefiendCooldownDelay,
} from './warlock.demonology.diabolist.rules'

export const demonologyWarlockDiabolist: HeroTalentOverlay = {
  heroTalentTree: 'diabolist',
  displayName: 'Diabolist',

  additionalContext:
    'Diabolist enhances Demonic Tyrant windows through Diabolic Ritual, which periodically activates and empowers your rotation. ' +
    'During Diabolic Ritual, Infernal Bolt replaces Shadow Bolt as your filler — it costs no Soul Shards and deals significantly more damage. ' +
    'Abyssal Dominion causes Demonic Tyrant to summon additional demons on cast, increasing the importance of having your full army active before Tyrant. ' +
    'Diabolist amplifies the standard Demonology priority: build to 5 Shards before Tyrant, use Dreadstalkers and Vilefiend on cooldown, and never miss an Infernal Bolt during Diabolic Ritual.',

  removedRuleIds: [],

  additionalRules: [
    {
      id: 'det-demo-001',
      name: "Hand of Gul'dan Low Shard Spending",
      severity: 'critical',
      description:
        "Hand of Gul'dan cast immediately after a previous cast — likely fewer than 3 Soul Shards.",
      whyItMatters:
        "Hand of Gul'dan summons 1 imp per Shard spent. Casting with 1–2 Shards instead of 3–5 summons fewer imps and reduces the total demon count available for Demonic Tyrant.",
      howToFix:
        "Wait until you have at least 3 Soul Shards before casting Hand of Gul'dan. Ideally spend 4–5 Shards to maximise imp count without overcapping.",
      detect: detectHogLowShards,
    },
    {
      id: 'det-demo-002',
      name: 'Call Dreadstalkers Cooldown Delayed',
      severity: 'moderate',
      description: 'Call Dreadstalkers cast more than 25s after the previous cast.',
      whyItMatters:
        'Dreadstalkers are one of your strongest demons for both damage and Demonic Tyrant empowerment. Delaying the cooldown reduces the number of Tyrant windows they can contribute to.',
      howToFix:
        'Cast Call Dreadstalkers on cooldown (20s CD) without holding for Tyrant windows unless Tyrant is less than 5s away.',
      detect: detectDreadstalkersCooldownDelay,
    },
    {
      id: 'det-demo-003',
      name: 'Vilefiend Cooldown Delayed',
      severity: 'moderate',
      description: 'Vilefiend cast more than 50s after the previous cast.',
      whyItMatters:
        'Vilefiend is a significant demon for Tyrant empowerment. Holding it too long means fewer Tyrant windows benefit from its presence.',
      howToFix: 'Cast Vilefiend on cooldown (45s CD). Only delay if Demonic Tyrant is within 5–8s.',
      detect: detectVilefiendCooldownDelay,
    },
    {
      id: 'det-demo-diab-001',
      name: 'Demonic Tyrant Cast With Low Demon Count',
      severity: 'critical',
      description: 'Demonic Tyrant cast with fewer than 2 summon spells used in the preceding 15s.',
      whyItMatters:
        'Demonic Tyrant extends all currently active demons. Casting it with few demons active wastes most of its empowerment value and is a major DPS loss.',
      howToFix:
        "Before Tyrant, ensure at minimum: Call Dreadstalkers + Hand of Gul'dan (3+ Shards) are cast. Ideal: add Vilefiend if off cooldown. Then cast Tyrant into a full army.",
      detect: detectTyrantLowDemonCount,
    },
    {
      id: 'det-demo-diab-002',
      name: 'Shadow Bolt Cast During Diabolic Ritual',
      severity: 'moderate',
      description: 'Shadow Bolt cast during Diabolic Ritual instead of Infernal Bolt.',
      whyItMatters:
        'Infernal Bolt is a free, high-damage replacement for Shadow Bolt that is available only during Diabolic Ritual. Casting Shadow Bolt instead is a direct damage loss.',
      howToFix:
        'Track the Diabolic Ritual buff. When it is active, use Infernal Bolt for all filler GCDs instead of Shadow Bolt.',
      detect: detectMissedInfernalBoltDuringRitual,
    },
  ],

  additionalMistakes: [
    "Casting Hand of Gul'dan with 1–2 Soul Shards, summoning only 1–2 imps and significantly reducing demon army size for Tyrant.",
    'Casting Demonic Tyrant into a nearly empty demon army, extending few demons and wasting the major cooldown.',
    'Casting Shadow Bolt during Diabolic Ritual instead of the free, higher-damage Infernal Bolt replacement.',
    'Holding Call Dreadstalkers or Vilefiend too long waiting for the perfect Tyrant setup, losing overall cooldown uses per fight.',
  ],

  spellIds: {
    'Diabolic Ritual': DEMO_WARLOCK_SPELL_IDS.DIABOLIC_RITUAL,
    'Infernal Bolt': DEMO_WARLOCK_SPELL_IDS.INFERNAL_BOLT,
    'Abyssal Dominion': DEMO_WARLOCK_SPELL_IDS.ABYSSAL_DOMINION,
  },
}
