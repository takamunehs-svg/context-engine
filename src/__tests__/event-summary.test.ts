import { describe, it, expect } from 'vitest'
import { summarizeEvent } from '../lib/event-summary'
import type { ActivityEvent } from '../types/core'

// Characterization tests for summarizeEvent.
// These lock in existing behavior so regressions surface immediately.
// Do not change these tests to match new behavior; update them only after
// the intended behavior change is confirmed.

const base: ActivityEvent = {
  id: 'evt-001',
  event_type: 'session',
  subject_id: 'client-a',
  recorded_at: '2026-04-15T10:00:00.000Z',
  context: {},
}

describe('summarizeEvent — date extraction', () => {
  it('returns the YYYY-MM-DD portion of recorded_at', () => {
    expect(summarizeEvent(base).date).toBe('2026-04-15')
  })

  it('returns full string when recorded_at has no T separator', () => {
    const ev: ActivityEvent = { ...base, recorded_at: '2026-04-15' }
    expect(summarizeEvent(ev).date).toBe('2026-04-15')
  })
})

describe('summarizeEvent — empty context', () => {
  it('returns empty metrics, empty notes, hasMore false', () => {
    const result = summarizeEvent(base)
    expect(result.metrics).toEqual([])
    expect(result.notes).toBe('')
    expect(result.hasMore).toBe(false)
  })
})

describe('summarizeEvent — notes extraction', () => {
  it('picks session_notes from inputs', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { inputs: { session_notes: '今日は集中できた' } },
    }
    expect(summarizeEvent(ev).notes).toBe('今日は集中できた')
  })

  it('falls back to notes key if session_notes absent', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { inputs: { notes: 'フォールバック' } },
    }
    expect(summarizeEvent(ev).notes).toBe('フォールバック')
  })

  it('prefers notes over session_notes when both present (NOTE_CANDIDATE_KEYS order)', () => {
    // NOTE_CANDIDATE_KEYS = ["notes", "note", "session_notes", ...]
    // "notes" is evaluated first, so it wins.
    const ev: ActivityEvent = {
      ...base,
      context: { inputs: { notes: '前', session_notes: '後' } },
    }
    expect(summarizeEvent(ev).notes).toBe('前')
  })
})

describe('summarizeEvent — metrics extraction', () => {
  it('converts scalar facts to labelled metrics', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { facts: { stakeholder_alignment: 3, rollout_risk: 4 } },
    }
    const { metrics } = summarizeEvent(ev)
    expect(metrics).toHaveLength(2)
    expect(metrics[0]).toEqual({ key: '意思決定者の納得度', value: '3' })
    expect(metrics[1]).toEqual({ key: '展開リスク', value: '4' })
  })

  it('humanizes unknown keys via snake_case fallback', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { facts: { custom_score: 7 } },
    }
    const { metrics } = summarizeEvent(ev)
    expect(metrics[0].key).toBe('custom score')
  })

  it('truncates values longer than 40 chars', () => {
    const long = 'x'.repeat(50)
    const ev: ActivityEvent = {
      ...base,
      context: { facts: { custom_field: long } },
    }
    const { metrics } = summarizeEvent(ev)
    expect(metrics[0].value).toHaveLength(40)
    expect(metrics[0].value.endsWith('…')).toBe(true)
  })

  it('skips non-scalar facts (arrays)', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { facts: { tags: ['a', 'b'] } },
    }
    expect(summarizeEvent(ev).metrics).toHaveLength(0)
  })
})

describe('summarizeEvent — hasMore flag', () => {
  it('is true when refs are present', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { refs: ['dict/risk-levels'] },
    }
    expect(summarizeEvent(ev).hasMore).toBe(true)
  })

  it('is true when snapshot is present', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { snapshot: { some: 'data' } },
    }
    expect(summarizeEvent(ev).hasMore).toBe(true)
  })

  it('is true when inputs contain a non-note key', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { inputs: { unknown_field: 'value' } },
    }
    expect(summarizeEvent(ev).hasMore).toBe(true)
  })

  it('is false when inputs contain only known note keys', () => {
    const ev: ActivityEvent = {
      ...base,
      context: { inputs: { session_notes: 'x', notes: 'y' } },
    }
    expect(summarizeEvent(ev).hasMore).toBe(false)
  })
})
