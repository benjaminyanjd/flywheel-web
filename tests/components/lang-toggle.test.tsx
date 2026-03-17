import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LangToggle } from '@/components/lang-toggle'

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}))

// Mock localStorage
const storage: Record<string, string> = {}
beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k])
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => storage[key] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { storage[key] = val })
})

describe('LangToggle', () => {
  it('renders with default zh → shows "EN"', () => {
    render(<LangToggle />)
    expect(screen.getByRole('button')).toHaveTextContent('EN')
  })

  it('clicking toggles to en → shows "中"', async () => {
    const user = userEvent.setup()
    render(<LangToggle />)
    const btn = screen.getByRole('button')
    await user.click(btn)
    expect(btn).toHaveTextContent('中')
  })

  it('applies custom className', () => {
    render(<LangToggle className="my-class" />)
    expect(screen.getByRole('button').className).toContain('my-class')
  })
})
