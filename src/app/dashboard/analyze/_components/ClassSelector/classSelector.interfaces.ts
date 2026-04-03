export interface HeroTalent {
  key: string
  name: string
}

export interface WowSpec {
  key: string
  name: string
  role: 'dps' | 'healer' | 'tank'
  heroTalents: HeroTalent[]
}

export interface WowClass {
  key: string
  name: string
  color: string
  iconUrl: string
  specs: WowSpec[]
  comingSoon?: boolean | undefined
}

export interface ClassSelectorProps {
  selectedSpecKey: string | null
  selectedHeroTalent: string | null
  onSpecSelect: (specKey: string) => void
  onHeroTalentSelect: (tree: string) => void
}
