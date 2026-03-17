import { describe, it, expect, vi } from 'vitest'

// Mock better-sqlite3 before importing route
vi.mock('better-sqlite3', () => ({
  default: vi.fn(() => ({
    prepare: vi.fn(() => ({ get: vi.fn(() => ({ '1': 1 })) })),
    close: vi.fn(),
  })),
}))

import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data).toHaveProperty('ts')
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('db')
    expect(data).toHaveProperty('latency')
  })

  it('ts is a recent timestamp', async () => {
    const before = Date.now()
    const response = await GET()
    const data = await response.json()
    expect(data.ts).toBeGreaterThanOrEqual(before)
    expect(data.ts).toBeLessThanOrEqual(Date.now() + 1000)
  })
})
