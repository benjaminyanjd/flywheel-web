import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WaitlistForm from '@/components/waitlist-form'

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
  vi.restoreAllMocks()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => storage[key] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { storage[key] = val })
})

describe('WaitlistForm', () => {
  it('renders telegram and email inputs', () => {
    render(<WaitlistForm />)
    expect(screen.getByPlaceholderText(/@/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /試用|Trial/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<WaitlistForm />)
    const btn = screen.getByRole('button', { name: /試用|Trial/i })
    await user.click(btn)
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/請填寫 Telegram/)).toBeInTheDocument()
      expect(screen.getByText(/請填寫電子郵件/)).toBeInTheDocument()
    })
  })

  it('shows email format error for invalid email', async () => {
    const user = userEvent.setup()
    render(<WaitlistForm />)
    const tgInput = screen.getByPlaceholderText(/@/)
    const emailInput = screen.getByPlaceholderText(/電子郵件|Email/i)
    await user.type(tgInput, '@testuser')
    await user.type(emailInput, 'notanemail')
    const btn = screen.getByRole('button', { name: /試用|Trial/i })
    await user.click(btn)
    await waitFor(() => {
      expect(screen.getByText(/有效的電子郵件/)).toBeInTheDocument()
    })
  })

  it('submits successfully with valid data', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as unknown as typeof fetch

    render(<WaitlistForm />)
    const tgInput = screen.getByPlaceholderText(/@/)
    const emailInput = screen.getByPlaceholderText(/電子郵件|Email/i)
    await user.type(tgInput, '@testuser')
    await user.type(emailInput, 'test@example.com')
    const btn = screen.getByRole('button', { name: /試用|Trial/i })
    await user.click(btn)

    await waitFor(() => {
      expect(screen.getByText(/申請已收到/)).toBeInTheDocument()
    })
  })
})
