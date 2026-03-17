import { describe, it, expect, vi } from 'vitest'

// Mock the db module
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => ({
    prepare: vi.fn(() => ({
      all: vi.fn(() => []),
    })),
  })),
}))

import { GET } from '@/app/api/preview-opps/route'

describe('GET /api/preview-opps', () => {
  it('returns 200 with opps array', async () => {
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('opps')
    expect(Array.isArray(data.opps)).toBe(true)
  })

  it('returns empty array when no data', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.opps).toEqual([])
  })
})
