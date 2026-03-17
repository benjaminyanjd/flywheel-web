"use client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PostHog = any

export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return
  const ph = (window as PostHog).posthog
  if (!ph) return
  ph.capture(event, props)
}

export function identify(userId: string, traits?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return
  const ph = (window as PostHog).posthog
  if (!ph) return
  ph.identify(userId, traits)
}
