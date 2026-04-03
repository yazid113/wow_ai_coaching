export type FightType = 'raid' | 'mythicplus' | 'targetdummy' | 'dungeon'

export interface FightContext {
  fightType: FightType
  targetCount: number
  itemLevel?: number | undefined
  notes?: string | undefined
}

export interface FightContextProps {
  value: FightContext
  onChange: (ctx: FightContext) => void
}

export const DEFAULT_FIGHT_CONTEXT: FightContext = {
  fightType: 'raid',
  targetCount: 1,
}
