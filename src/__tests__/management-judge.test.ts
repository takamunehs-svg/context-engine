import { describe, it, expect } from 'vitest'
import { normalizeRuleFacts, evaluateRules } from '../lib/fs/management-judge'
import type { ManagementRule } from '../types/core'

// ─────────────────────────────────────────────
// normalizeRuleFacts
// ─────────────────────────────────────────────

describe('normalizeRuleFacts', () => {
  it('returns flat input unchanged', () => {
    const flat = { stakeholder_alignment: 3, rollout_risk: 4 }
    expect(normalizeRuleFacts(flat)).toEqual(flat)
  })

  it('unwraps a nested facts object to the top level', () => {
    const nested = { facts: { stakeholder_alignment: 3, rollout_risk: 4 } }
    expect(normalizeRuleFacts(nested)).toEqual({
      facts: { stakeholder_alignment: 3, rollout_risk: 4 },
      stakeholder_alignment: 3,
      rollout_risk: 4,
    })
  })

  it('does not mutate the original input', () => {
    const nested = { facts: { rollout_risk: 4 } }
    const original = JSON.stringify(nested)
    normalizeRuleFacts(nested)
    expect(JSON.stringify(nested)).toBe(original)
  })

  it('ignores a facts key that is an array', () => {
    const input = { facts: ['a', 'b'], rollout_risk: 4 }
    expect(normalizeRuleFacts(input)).toEqual(input)
  })

  it('ignores a facts key that is null', () => {
    const input = { facts: null, rollout_risk: 4 }
    expect(normalizeRuleFacts(input)).toEqual(input)
  })

  it('returns empty input unchanged', () => {
    expect(normalizeRuleFacts({})).toEqual({})
  })
})

// ─────────────────────────────────────────────
// Shared rule fixtures (matches sample-tenant intervention-rules.yaml)
// ─────────────────────────────────────────────

const GOVERNANCE_RULE: ManagementRule = {
  rule_id: 'governance_gap_high',
  trigger: 'any',
  conditions: [
    { field: 'rollout_risk', op: '>=', value: 4 },
    { field: 'operating_clarity', op: '<=', value: 2 },
  ],
  output: { risk_level: 'high', action: 'governance_first_plan' },
}

const ALIGNMENT_RULE: ManagementRule = {
  rule_id: 'executive_alignment_needed',
  trigger: 'any',
  conditions: [{ field: 'stakeholder_alignment', op: '<=', value: 2 }],
  output: { risk_level: 'medium', action: 'executive_alignment_plan' },
}

const ROLLOUT_RULE: ManagementRule = {
  rule_id: 'rollout_ready',
  trigger: 'all',
  conditions: [
    { field: 'field_readiness', op: '>=', value: 4 },
    { field: 'operating_clarity', op: '>=', value: 3 },
    { field: 'rollout_risk', op: '<=', value: 3 },
  ],
  output: { risk_level: 'low', action: 'rollout_enablement_plan' },
}

const DEFAULT_RULE: ManagementRule = {
  rule_id: 'discovery_default',
  trigger: 'default',
  conditions: [],
  output: { risk_level: 'watch', action: 'standard_followup_plan' },
}

const ALL_RULES = [GOVERNANCE_RULE, ALIGNMENT_RULE, ROLLOUT_RULE, DEFAULT_RULE]

// ─────────────────────────────────────────────
// evaluateRules — flat vs nested parity
// ─────────────────────────────────────────────

describe('evaluateRules — flat and nested facts produce the same result', () => {
  // Demo scenario: governance gap (rollout_risk=4, operating_clarity=2)
  const flatFacts = { stakeholder_alignment: 3, operating_clarity: 2, field_readiness: 4, rollout_risk: 4 }
  const nestedFacts = { facts: { stakeholder_alignment: 3, operating_clarity: 2, field_readiness: 4, rollout_risk: 4 } }

  it('matches governance_gap_high for flat facts', () => {
    const result = evaluateRules(ALL_RULES, flatFacts)
    expect(result?.rule_id).toBe('governance_gap_high')
  })

  it('matches governance_gap_high for nested facts after normalization', () => {
    const result = evaluateRules(ALL_RULES, normalizeRuleFacts(nestedFacts))
    expect(result?.rule_id).toBe('governance_gap_high')
  })

  it('both shapes produce identical rule_id and output', () => {
    const flat = evaluateRules(ALL_RULES, flatFacts)
    const nested = evaluateRules(ALL_RULES, normalizeRuleFacts(nestedFacts))
    expect(flat?.rule_id).toBe(nested?.rule_id)
    expect(flat?.output).toEqual(nested?.output)
  })
})

// ─────────────────────────────────────────────
// evaluateRules — rule precedence
// ─────────────────────────────────────────────

describe('evaluateRules — rule precedence', () => {
  it('non-default rules are checked before default', () => {
    const facts = { rollout_risk: 1, operating_clarity: 5 } // no non-default match
    const result = evaluateRules(ALL_RULES, facts)
    expect(result?.rule_id).toBe('discovery_default')
  })

  it('returns first matching non-default rule in declaration order', () => {
    // rollout_risk=4 triggers governance_gap_high (trigger:any, listed first)
    // stakeholder_alignment=2 would also trigger executive_alignment_needed
    const facts = { rollout_risk: 4, stakeholder_alignment: 2, operating_clarity: 3 }
    const result = evaluateRules(ALL_RULES, facts)
    expect(result?.rule_id).toBe('governance_gap_high')
  })

  it('returns null when rules list is empty', () => {
    expect(evaluateRules([], { rollout_risk: 4 })).toBeNull()
  })

  it('returns null when no rules match and there is no default', () => {
    const noDefault = [GOVERNANCE_RULE, ALIGNMENT_RULE, ROLLOUT_RULE]
    const facts = { rollout_risk: 1, stakeholder_alignment: 5 }
    expect(evaluateRules(noDefault, facts)).toBeNull()
  })
})

// ─────────────────────────────────────────────
// evaluateRules — trigger types
// ─────────────────────────────────────────────

describe('evaluateRules — trigger: any', () => {
  it('matches when at least one condition is true', () => {
    // governance_gap_high: rollout_risk>=4 OR operating_clarity<=2
    const result = evaluateRules([GOVERNANCE_RULE], { rollout_risk: 4, operating_clarity: 5 })
    expect(result?.rule_id).toBe('governance_gap_high')
  })

  it('does not match when all conditions are false', () => {
    const result = evaluateRules([GOVERNANCE_RULE], { rollout_risk: 3, operating_clarity: 3 })
    expect(result).toBeNull()
  })
})

describe('evaluateRules — trigger: all', () => {
  it('matches only when every condition is true', () => {
    const facts = { field_readiness: 4, operating_clarity: 3, rollout_risk: 3 }
    const result = evaluateRules([ROLLOUT_RULE], facts)
    expect(result?.rule_id).toBe('rollout_ready')
  })

  it('does not match when one condition fails', () => {
    const facts = { field_readiness: 4, operating_clarity: 3, rollout_risk: 4 } // rollout_risk too high
    const result = evaluateRules([ROLLOUT_RULE], facts)
    expect(result).toBeNull()
  })
})

// ─────────────────────────────────────────────
// evaluateRules — double-bound conditions (op2 / value2)
// ─────────────────────────────────────────────

describe('evaluateRules — double-bound conditions (op2/value2)', () => {
  const windowRule: ManagementRule = {
    rule_id: 'window_test',
    trigger: 'all',
    conditions: [{ field: 'score', op: '>=', value: 3, op2: '<=', value2: 5 }],
    output: { action: 'in_window' },
  }

  it('matches when value is inside the window', () => {
    expect(evaluateRules([windowRule], { score: 4 })?.rule_id).toBe('window_test')
    expect(evaluateRules([windowRule], { score: 3 })?.rule_id).toBe('window_test')
    expect(evaluateRules([windowRule], { score: 5 })?.rule_id).toBe('window_test')
  })

  it('does not match when value is outside the window', () => {
    expect(evaluateRules([windowRule], { score: 2 })).toBeNull()
    expect(evaluateRules([windowRule], { score: 6 })).toBeNull()
  })
})

// ─────────────────────────────────────────────
// evaluateRules — missing / null fields
// ─────────────────────────────────────────────

describe('evaluateRules — missing fields evaluate to false', () => {
  it('condition evaluates false when the field is absent', () => {
    const result = evaluateRules([GOVERNANCE_RULE], { unrelated: 99 })
    expect(result).toBeNull()
  })

  it('condition evaluates false when the value is null', () => {
    const result = evaluateRules([GOVERNANCE_RULE], { rollout_risk: null })
    expect(result).toBeNull()
  })
})
