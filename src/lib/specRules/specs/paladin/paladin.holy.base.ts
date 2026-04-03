import type { BaseSpecDefinition } from '../../types'

export const holyPaladin: BaseSpecDefinition = {
  specKey: 'paladin-holy',
  className: 'Paladin',
  specName: 'Holy Paladin',
  patchVersion: '11.1',
  supportedHeroTalents: ['herald-of-the-sun', 'lightsmith'],

  rotationSummary:
    'Holy Paladin generates Holy Power through Holy Shock and Crusader Strike, spending it on Word of Glory for direct heals or Light of Dawn for group healing. ' +
    'Holy Shock is the core proc generator and must be used on cooldown to sustain Holy Power flow and trigger Infusion of Light for empowered Holy Light or Flash of Light casts. ' +
    'Beacon of Light passively copies a portion of heals to the target — keep it applied to the tank and position to maximise healing transfer. ' +
    'Herald of the Sun adds Dawnlight procs that extend and amplify spender healing windows.',

  spellIds: {},

  commonMistakes: [
    'Letting Holy Shock sit off cooldown, breaking the Holy Power generation loop and losing Infusion of Light proc opportunities.',
    'Overcapping Holy Power by delaying Word of Glory or Light of Dawn spenders.',
    'Allowing Beacon of Light to fall off the tank, losing passive healing transfer throughout the fight.',
  ],

  rules: [],
}
