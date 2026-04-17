import { describe, expect, it } from 'vitest'
import { getDirection, supportedLanguages } from '../src'
import { en } from '../src/locales/en'
import { he } from '../src/locales/he'

describe('locale completeness', () => {
  it('hebrew has all english keys', () => {
    const enKeys = Object.keys(en).sort()
    const heKeys = Object.keys(he).sort()
    expect(heKeys).toEqual(enKeys)
  })

  it('no empty values in english', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en.${key} is empty`).not.toBe('')
    }
  })

  it('no empty values in hebrew', () => {
    for (const [key, value] of Object.entries(he)) {
      expect(value, `he.${key} is empty`).not.toBe('')
    }
  })
})

describe('getDirection', () => {
  it('returns rtl for hebrew', () => {
    expect(getDirection('he')).toBe('rtl')
  })

  it('returns ltr for english', () => {
    expect(getDirection('en')).toBe('ltr')
  })
})

describe('supportedLanguages', () => {
  it('includes en and he', () => {
    expect(supportedLanguages).toContain('en')
    expect(supportedLanguages).toContain('he')
  })
})
