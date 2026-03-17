import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (class name merge)', () => {
  it('merges multiple class strings', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conditional classes via clsx', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('handles empty / undefined inputs', () => {
    expect(cn()).toBe('')
    expect(cn(undefined, null, '')).toBe('')
  })

  it('merges arrays and objects', () => {
    const result = cn(['flex', 'gap-2'], { 'text-red-500': true, hidden: false })
    expect(result).toContain('flex')
    expect(result).toContain('gap-2')
    expect(result).toContain('text-red-500')
    expect(result).not.toContain('hidden')
  })
})
