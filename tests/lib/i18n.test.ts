import { describe, it, expect } from 'vitest'
import { translations } from '@/lib/i18n'

const zhKeys = Object.keys(translations.zh) as string[]
const enKeys = Object.keys(translations.en) as string[]

describe('i18n translations', () => {
  it('zh has translations', () => {
    expect(zhKeys.length).toBeGreaterThan(0)
  })

  it('en has translations', () => {
    expect(enKeys.length).toBeGreaterThan(0)
  })

  it('zh and en have the same number of keys', () => {
    expect(zhKeys.length).toBe(enKeys.length)
  })

  it('every zh key exists in en', () => {
    const missing = zhKeys.filter((k) => !enKeys.includes(k))
    expect(missing).toEqual([])
  })

  it('every en key exists in zh', () => {
    const missing = enKeys.filter((k) => !zhKeys.includes(k))
    expect(missing).toEqual([])
  })

  it('no zh value is empty string except intentional blanks', () => {
    // Some keys are intentionally blank (auth_signin_h_pre, etc.)
    const intentionallyBlank = [
      'auth_signin_h_pre', 'auth_signin_h_mid', 'auth_signin_h_line2', 'auth_signin_h_line3',
      'landing_applied',
    ]
    for (const key of zhKeys) {
      if (intentionallyBlank.includes(key)) continue
      expect(translations.zh[key as keyof typeof translations.zh], `zh.${key} should not be empty`).not.toBe('')
    }
  })
})
