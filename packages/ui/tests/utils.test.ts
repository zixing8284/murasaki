import { describe, expect, it } from 'vitest'
import { cn, cnPure } from '../src/lib/utils'

describe('cnPure', () => {
  // cnPure merges class names without injecting any base styles
  it('merges multiple class names', () => {
    expect(cnPure('px-2', 'py-4')).toBe('px-2 py-4')
  })

  it('resolves Tailwind conflicts — last class wins', () => {
    // tailwind-merge deduplicates conflicting utilities
    expect(cnPure('px-2', 'px-4')).toBe('px-4')
  })

  it('filters out falsy values (undefined, null, false)', () => {
    expect(cnPure('px-2', undefined, null, false, 'py-4')).toBe('px-2 py-4')
  })

  it('supports conditional objects (clsx feature)', () => {
    expect(cnPure({ 'bg-red-500': true, 'text-white': false })).toBe('bg-red-500')
  })

  it('does NOT inject the 11px base font class', () => {
    const result = cnPure('px-2')
    expect(result).not.toContain('text-[11px]')
  })

  it('returns empty string when given no arguments', () => {
    expect(cnPure()).toBe('')
  })
})

describe('cn', () => {
  // cn injects componentBaseStyles (text-[11px]) before user classes,
  // so components get the Win98 11px default font automatically.
  it('injects the 11px base font class', () => {
    const result = cn('px-2')
    expect(result).toContain('text-[11px]')
  })

  it('allows user classes to override the base font size', () => {
    // User passes text-sm — tailwind-merge should pick the latter
    const result = cn('text-sm')
    expect(result).toContain('text-sm')
    expect(result).not.toContain('text-[11px]')
  })

  it('merges classes the same way as cnPure', () => {
    const result = cn('px-2', 'py-4')
    expect(result).toContain('px-2')
    expect(result).toContain('py-4')
    expect(result).toContain('text-[11px]')
  })

  it('filters falsy values', () => {
    const result = cn('px-2', undefined, false, 'py-4')
    expect(result).toContain('px-2')
    expect(result).toContain('py-4')
  })

  it('supports conditional objects', () => {
    const result = cn({ 'bg-red-500': true, 'text-white': false })
    expect(result).toContain('bg-red-500')
    expect(result).not.toContain('text-white')
  })
})
