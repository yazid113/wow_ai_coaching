import { WOW_CLASSES } from '../classSelector.constants'
import type { HeroTalent } from '../classSelector.interfaces'

export function getHeroTalentsForSpec(specKey: string): HeroTalent[] {
  for (const cls of WOW_CLASSES) {
    const spec = cls.specs.find((s) => s.key === specKey)
    if (spec !== undefined) return spec.heroTalents
  }
  return []
}
