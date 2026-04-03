import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { composeSpec, getBaseSpec, validateOverlayCompatibility } from '../compose'
import { fireMageBase } from '../specs/mage/mage.fire.base'
import { fireMageSpellslinger } from '../specs/mage/mage.fire.spellslinger'
import { fireMageSunfury } from '../specs/mage/mage.fire.sunfury'
import type { HeroTalentOverlay } from '../types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockOverlayWithRemoval: HeroTalentOverlay = {
  heroTalentTree: 'sunfury',
  displayName: 'MockTree',
  additionalContext: 'Additional mock context.',
  additionalRules: [],
  removedRuleIds: ['fire-base-001'],
  additionalMistakes: ['Mock mistake.'],
  spellIds: { Fireball: 'MOCK_OVERRIDE' },
}

const unsupportedTreeOverlay: HeroTalentOverlay = {
  ...fireMageSunfury,
  heroTalentTree: 'frostfire',
}

const badRemovedRuleOverlay: HeroTalentOverlay = {
  ...fireMageSunfury,
  removedRuleIds: ['nonexistent-rule-id'],
}

const conflictingRuleOverlay: HeroTalentOverlay = {
  ...fireMageSunfury,
  additionalRules: [
    {
      id: 'fire-base-001',
      name: 'Conflict',
      severity: 'minor',
      description: 'Conflicts with base rule.',
      whyItMatters: 'Test.',
      howToFix: 'Test.',
      detect: () => [],
    },
  ],
}

// ─── composeSpec ──────────────────────────────────────────────────────────────

describe('composeSpec', () => {
  test('merges rotationSummary correctly', () => {
    const result = composeSpec(fireMageBase, fireMageSunfury)
    assert.ok(result.rotationSummary.includes(fireMageBase.rotationSummary))
    assert.ok(result.rotationSummary.includes(fireMageSunfury.additionalContext))
    assert.ok(result.rotationSummary.includes('HERO TALENT — Sunfury'))
  })

  test('removes rules listed in removedRuleIds', () => {
    const result = composeSpec(fireMageBase, mockOverlayWithRemoval)
    const ids = result.rules.map((r) => r.id)
    assert.ok(!ids.includes('fire-base-001'), 'fire-base-001 should be removed')
    assert.ok(ids.includes('fire-base-002'), 'fire-base-002 should remain')
  })

  test('adds overlay rules after base rules', () => {
    const result = composeSpec(fireMageBase, fireMageSunfury)
    const expectedCount = fireMageBase.rules.length + fireMageSunfury.additionalRules.length
    assert.strictEqual(result.rules.length, expectedCount)
    const tail = result.rules.slice(fireMageBase.rules.length)
    const tailIds = new Set(tail.map((r) => r.id))
    for (const rule of fireMageSunfury.additionalRules) {
      assert.ok(tailIds.has(rule.id), `Expected overlay rule ${rule.id} in tail`)
    }
  })

  test('merges spellIds with overlay winning on conflict', () => {
    const result = composeSpec(fireMageBase, mockOverlayWithRemoval)
    assert.strictEqual(result.spellIds['Fireball'], 'MOCK_OVERRIDE')
    assert.ok('Pyroblast' in result.spellIds, 'Non-conflicting base key should survive')
  })

  test('merges commonMistakes (base then overlay)', () => {
    const result = composeSpec(fireMageBase, fireMageSunfury)
    const expected = [...fireMageBase.commonMistakes, ...fireMageSunfury.additionalMistakes]
    assert.deepStrictEqual(result.commonMistakes, expected)
  })

  test('sets heroTalentTree from overlay', () => {
    const result = composeSpec(fireMageBase, fireMageSunfury)
    assert.strictEqual(result.heroTalentTree, 'sunfury')
  })

  test('sets displayName as "SpecName — TreeDisplayName"', () => {
    const result = composeSpec(fireMageBase, fireMageSunfury)
    assert.strictEqual(result.displayName, 'Fire Mage — Sunfury')
  })
})

// ─── getBaseSpec ──────────────────────────────────────────────────────────────

describe('getBaseSpec', () => {
  test('heroTalentTree is absent from result', () => {
    const result = getBaseSpec(fireMageBase)
    assert.ok(!('heroTalentTree' in result))
  })

  test('displayName equals specName with no suffix', () => {
    const result = getBaseSpec(fireMageBase)
    assert.strictEqual(result.displayName, fireMageBase.specName)
  })

  test('rules array matches base.rules', () => {
    const result = getBaseSpec(fireMageBase)
    assert.deepStrictEqual(result.rules, fireMageBase.rules)
  })

  test('spellIds matches base.spellIds', () => {
    const result = getBaseSpec(fireMageBase)
    assert.deepStrictEqual(result.spellIds, fireMageBase.spellIds)
  })
})

// ─── validateOverlayCompatibility ────────────────────────────────────────────

describe('validateOverlayCompatibility', () => {
  test('returns valid true for supported overlay (Sunfury)', () => {
    const { valid, errors } = validateOverlayCompatibility(fireMageBase, fireMageSunfury)
    assert.strictEqual(valid, true)
    assert.deepStrictEqual(errors, [])
  })

  test('returns valid true for supported overlay (Spellslinger)', () => {
    const { valid, errors } = validateOverlayCompatibility(fireMageBase, fireMageSpellslinger)
    assert.strictEqual(valid, true)
    assert.deepStrictEqual(errors, [])
  })

  test('returns valid false when heroTalentTree not in supportedHeroTalents', () => {
    const { valid, errors } = validateOverlayCompatibility(fireMageBase, unsupportedTreeOverlay)
    assert.strictEqual(valid, false)
    assert.ok(errors.length > 0)
    assert.ok(errors.some((e) => e.includes('frostfire')))
  })

  test('returns error when removedRuleId does not exist in base rules', () => {
    const { valid, errors } = validateOverlayCompatibility(fireMageBase, badRemovedRuleOverlay)
    assert.strictEqual(valid, false)
    assert.ok(errors.some((e) => e.includes('nonexistent-rule-id')))
  })

  test('returns error when additionalRule id conflicts with base rule', () => {
    const { valid, errors } = validateOverlayCompatibility(fireMageBase, conflictingRuleOverlay)
    assert.strictEqual(valid, false)
    assert.ok(errors.some((e) => e.includes('fire-base-001')))
  })
})
