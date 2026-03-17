import { describe, it, expect } from 'vitest'
import { parseEmbed, type EmbedData } from '@/lib/parse-embed'

describe('parseEmbed', () => {
  it('parses a valid JSON string with all fields', () => {
    const input = JSON.stringify({
      why_now: 'market crash',
      profit_logic: 'buy low sell high',
      actions: ['buy BTC', 'set stop-loss'],
      risks: ['volatility'],
      confidence: 8,
      deadline: '2024-12-31',
      estimated_time: '2h',
    })
    const result = parseEmbed(input) as EmbedData
    expect(result).not.toBeNull()
    expect(result.why_now).toBe('market crash')
    expect(result.profit_logic).toBe('buy low sell high')
    expect(result.actions).toEqual(['buy BTC', 'set stop-loss'])
    expect(result.risks).toEqual(['volatility'])
    expect(result.confidence).toBe(8)
    expect(result.deadline).toBe('2024-12-31')
    expect(result.estimated_time).toBe('2h')
  })

  it('returns null for invalid JSON', () => {
    expect(parseEmbed('not json')).toBeNull()
    expect(parseEmbed('{broken')).toBeNull()
  })

  it('defaults missing fields gracefully', () => {
    const result = parseEmbed('{}') as EmbedData
    expect(result).not.toBeNull()
    expect(result.why_now).toBe('')
    expect(result.profit_logic).toBe('')
    expect(result.actions).toEqual([])
    expect(result.risks).toEqual([])
    expect(result.confidence).toBe(0)
    expect(result.deadline).toBeUndefined()
    expect(result.estimated_time).toBeUndefined()
  })

  it('handles non-array actions/risks by defaulting to empty array', () => {
    const input = JSON.stringify({ actions: 'not-array', risks: 42 })
    const result = parseEmbed(input) as EmbedData
    expect(result.actions).toEqual([])
    expect(result.risks).toEqual([])
  })

  it('handles non-number confidence by defaulting to 0', () => {
    const input = JSON.stringify({ confidence: 'high' })
    const result = parseEmbed(input) as EmbedData
    expect(result.confidence).toBe(0)
  })
})
