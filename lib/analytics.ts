"use client"

export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return
  const ph = (window as any).posthog
  if (!ph) return
  ph.capture(event, props)
}

export function identify(userId: string, traits?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return
  const ph = (window as any).posthog
  if (!ph) return
  ph.identify(userId, traits)
}
