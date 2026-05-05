import { describe, it, expect, afterEach, vi } from 'vitest'
import { isReadOnly, assertWritable } from '../lib/read-only'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('isReadOnly', () => {
  it('returns true when READ_ONLY=true', () => {
    vi.stubEnv('READ_ONLY', 'true')
    expect(isReadOnly()).toBe(true)
  })

  it('returns false when READ_ONLY=false', () => {
    vi.stubEnv('READ_ONLY', 'false')
    expect(isReadOnly()).toBe(false)
  })

  it('returns false when READ_ONLY is unset', () => {
    vi.stubEnv('READ_ONLY', '')
    expect(isReadOnly()).toBe(false)
  })
})

describe('assertWritable', () => {
  it('throws when read-only', () => {
    vi.stubEnv('READ_ONLY', 'true')
    expect(() => assertWritable()).toThrow('READ_ONLY_MODE')
  })

  it('returns void when writable', () => {
    vi.stubEnv('READ_ONLY', 'false')
    expect(() => assertWritable()).not.toThrow()
  })
})
