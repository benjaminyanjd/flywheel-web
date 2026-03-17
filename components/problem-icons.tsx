"use client"
import { useId } from "react"

function esc(s: string) {
  return s.replace(/:/g, "\\:")
}

// ── Info Gap: pulsing concentric circles (radar style) ──
export function InfoGapIcon() {
  const id = esc(useId())
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <style>{`
        @keyframes ${id}-pulse1 { 0%,100% { opacity:0.12; } 50% { opacity:0.3; } }
        @keyframes ${id}-pulse2 { 0%,100% { opacity:0.25; } 50% { opacity:0.5; } }
        @keyframes ${id}-dot { 0%,100% { r:3; } 50% { r:4.5; } }
      `}</style>
      <circle cx="24" cy="24" r="20" style={{ animation: `${id}-pulse1 3s ease-in-out infinite` }} />
      <circle cx="24" cy="24" r="12" style={{ animation: `${id}-pulse2 3s ease-in-out infinite 0.3s` }} />
      <circle cx="24" cy="24" r="4" style={{ animation: `${id}-dot 2s ease-in-out infinite` }} />
    </svg>
  )
}

// ── Cognition Gap: brain with sparking neurons ──
export function CognitionGapIcon() {
  const id = esc(useId())
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <style>{`
        @keyframes ${id}-n1 { 0%,100% { opacity:0.3; fill:transparent; } 50% { opacity:1; fill:currentColor; } }
        @keyframes ${id}-n2 { 0%,100% { opacity:0.3; fill:transparent; } 50% { opacity:1; fill:currentColor; } }
        @keyframes ${id}-n3 { 0%,100% { opacity:0.3; fill:transparent; } 50% { opacity:1; fill:currentColor; } }
        @keyframes ${id}-zap { 0%,70%,100% { opacity:0; } 75%,95% { opacity:1; } }
      `}</style>
      {/* Brain outline */}
      <path d="M24 6c-5 0-9 3-10 7-4 1-6 5-6 9s2 7 5 8c1 4 5 7 9 7h4c4 0 8-3 9-7 3-1 5-4 5-8s-2-8-6-9c-1-4-5-7-10-7z" fill="none" />
      <path d="M24 13v22" opacity="0.3" />
      <circle cx="18" cy="20" r="2.5" style={{ animation: `${id}-n1 2.4s ease-in-out infinite` }} />
      <circle cx="30" cy="20" r="2.5" style={{ animation: `${id}-n2 2.4s ease-in-out infinite 0.8s` }} />
      <circle cx="24" cy="30" r="2.5" style={{ animation: `${id}-n3 2.4s ease-in-out infinite 1.6s` }} />
      <line x1="18" y1="20" x2="30" y2="20" opacity="0.2" />
      <line x1="18" y1="20" x2="24" y2="30" opacity="0.2" />
      <line x1="30" y1="20" x2="24" y2="30" opacity="0.2" />
      <path d="M33 10l-3 5h4l-3 5" strokeWidth="2" style={{ animation: `${id}-zap 3s ease-in-out infinite` }} />
    </svg>
  )
}

// ── Action Gap: play button with pulse ring ──
export function ActionGapIcon() {
  const id = esc(useId())
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <style>{`
        @keyframes ${id}-ring { 0% { r:18; opacity:0.4; } 100% { r:23; opacity:0; } }
        @keyframes ${id}-play { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
      `}</style>
      <circle cx="24" cy="24" r="18" style={{ animation: `${id}-ring 2s ease-out infinite` }} fill="none" />
      <circle cx="24" cy="24" r="18" fill="none" />
      <g style={{ transformOrigin: "24px 24px", animation: `${id}-play 2s ease-in-out infinite` }}>
        <polygon points="20,16 34,24 20,32" fill="currentColor" stroke="none" opacity="0.8" />
      </g>
    </svg>
  )
}
