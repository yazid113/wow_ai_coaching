import { HEALER_GROUP } from './classSelector.constants.healer'
import { HUNTER_GROUP } from './classSelector.constants.hunter'
import { MAGE_CLASS } from './classSelector.constants.mage'
import { WARLOCK_CLASS } from './classSelector.constants.warlock'
import { WARRIOR_GROUP } from './classSelector.constants.warrior'
import type { WowClass } from './classSelector.interfaces'

export const CLASS_COLORS: Record<string, string> = {
  'death-knight': '#C41E3A',
  'demon-hunter': '#A330C9',
  druid: '#FF7C0A',
  evoker: '#33937F',
  hunter: '#AAD372',
  mage: '#3FC7EB',
  monk: '#00FF98',
  paladin: '#F48CBA',
  priest: '#FFFFFF',
  rogue: '#FFF468',
  shaman: '#0070DD',
  warlock: '#8788EE',
  warrior: '#C69B3A',
}

export const WOW_CLASSES: WowClass[] = [
  ...WARRIOR_GROUP,
  ...HUNTER_GROUP,
  ...HEALER_GROUP,
  ...MAGE_CLASS,
  ...WARLOCK_CLASS,
]
