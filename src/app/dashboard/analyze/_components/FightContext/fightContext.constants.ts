import type { FightType } from './fightContext.interfaces'

export const FIGHT_TYPE_LABELS: Record<FightType, string> = {
  raid: 'Raid Boss',
  mythicplus: 'Mythic+',
  dungeon: 'Dungeon',
  targetdummy: 'Target Dummy',
}

export const FIGHT_TYPE_DESCRIPTIONS: Record<FightType, string> = {
  raid: 'Single boss encounter with mechanics',
  mythicplus: 'Timed dungeon with multiple packs',
  dungeon: 'Normal or heroic dungeon',
  targetdummy: 'Practice only — no mechanics',
}

export const TARGET_COUNT_OPTIONS = [1, 2, 3, 4, 5] as const
