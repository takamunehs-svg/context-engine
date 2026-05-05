import { describe, it, expect } from 'vitest'
import { humanizeKey } from '../lib/labels'

// Characterization tests for humanizeKey.
// These lock in the shared label mapping so both event-summary and judge-result
// stay consistent when field names or display strings change.

describe('humanizeKey — known labels', () => {
  const cases: [string, string][] = [
    ['session_date',           '支援日'],
    ['measured_date',          'チェック日'],
    ['duration_min',           '時間'],
    ['stakeholder_alignment',  '意思決定者の納得度'],
    ['operating_clarity',      '運用設計の明確さ'],
    ['field_readiness',        '現場の準備度'],
    ['rollout_risk',           '展開リスク'],
    ['milestone_progress_pct', 'マイルストーン進捗'],
    ['decision_latency_days',  '意思決定の停滞日数'],
    ['adoption_readiness',     '定着準備度'],
  ]

  for (const [key, expected] of cases) {
    it(`"${key}" → "${expected}"`, () => {
      expect(humanizeKey(key)).toBe(expected)
    })
  }
})

describe('humanizeKey — fallback for unknown keys', () => {
  it('converts snake_case to space-separated', () => {
    expect(humanizeKey('custom_score')).toBe('custom score')
  })

  it('converts dotted path to " › " separator', () => {
    expect(humanizeKey('nested.field')).toBe('nested › field')
  })

  it('handles combined snake_case and dotted path', () => {
    expect(humanizeKey('outer_key.inner_field')).toBe('outer key › inner field')
  })

  it('returns a plain key unchanged (no underscores or dots)', () => {
    expect(humanizeKey('score')).toBe('score')
  })
})
