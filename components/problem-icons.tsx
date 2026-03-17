"use client"
import { useId } from "react"

function esc(s: string) {
  return s.replace(/:/g, "\\:")
}

// ── Info Gap: pulsing concentric circles (radar style) ──
export function InfoGapIcon() {
  const id = esc(useId())
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <style>{`
        @keyframes ${id}-pulse1 { 0%,100% { opacity:0.12; } 50% { opacity:0.3; } }
        @keyframes ${id}-pulse2 { 0%,100% { opacity:0.25; } 50% { opacity:0.5; } }
        @keyframes ${id}-dot { 0%,100% { r:4; } 50% { r:6; } }
      `}</style>
      <circle cx="32" cy="32" r="27" style={{ animation: `${id}-pulse1 3s ease-in-out infinite` }} />
      <circle cx="32" cy="32" r="16" style={{ animation: `${id}-pulse2 3s ease-in-out infinite 0.3s` }} />
      <circle cx="32" cy="32" r="5" style={{ animation: `${id}-dot 2s ease-in-out infinite` }} />
    </svg>
  )
}

// ── Cognition Gap: brain with sparking neurons ──
export function CognitionGapIcon() {
  const id = esc(useId())
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <style>{`
        @keyframes ${id}-n1 { 0%,100% { opacity:0.3; fill:transparent; } 50% { opacity:1; fill:currentColor; } }
        @keyframes ${id}-n2 { 0%,100% { opacity:0.3; fill:transparent; } 50% { opacity:1; fill:currentColor; } }
        @keyframes ${id}-n3 { 0%,100% { opacity:0.3; fill:transparent; } 50% { opacity:1; fill:currentColor; } }
        @keyframes ${id}-zap { 0%,70%,100% { opacity:0; } 75%,95% { opacity:1; } }
      `}</style>
      {/* Brain outline */}
      <path d="M32 8c-6.7 0-12 4-13.3 9.3-5.3 1.3-8 6.7-8 12s2.7 9.3 6.7 10.7c1.3 5.3 6.7 9.3 12 9.3h5.3c5.3 0 10.7-4 12-9.3 4-1.3 6.7-5.3 6.7-10.7s-2.7-10.7-8-12c-1.3-5.3-6.7-9.3-13.3-9.3z" fill="none" />
      <path d="M32 17v30" opacity="0.3" />
      <circle cx="24" cy="27" r="3.3" style={{ animation: `${id}-n1 2.4s ease-in-out infinite` }} />
      <circle cx="40" cy="27" r="3.3" style={{ animation: `${id}-n2 2.4s ease-in-out infinite 0.8s` }} />
      <circle cx="32" cy="40" r="3.3" style={{ animation: `${id}-n3 2.4s ease-in-out infinite 1.6s` }} />
      <line x1="24" y1="27" x2="40" y2="27" opacity="0.2" />
      <line x1="24" y1="27" x2="32" y2="40" opacity="0.2" />
      <line x1="40" y1="27" x2="32" y2="40" opacity="0.2" />
      <path d="M44 13l-4 7h5l-4 7" strokeWidth="2.5" style={{ animation: `${id}-zap 3s ease-in-out infinite` }} />
    </svg>
  )
}

// ── Action Gap: footprint + question mark (knows but can't act) ──
export function ActionGapIcon() {
  const id = esc(useId())
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <style>{`
        @keyframes ${id}-shake { 0%,100% { transform:translate(0,0); } 15% { transform:translate(-0.5px,0); } 30% { transform:translate(0.5px,0); } 45% { transform:translate(-0.5px,0); } 60% { transform:translate(0.5px,0); } 75% { transform:translate(0,0); } }
        @keyframes ${id}-qpulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.15); } }
      `}</style>
      {/* Footprint / shoe outline */}
      <g style={{ animation: `${id}-shake 2.5s ease-in-out infinite` }}>
        {/* Sole shape */}
        <path d="M14 22c0-3 2-6 5-7.5 3-1.5 6.5-1 9 1 2 1.6 3 4 3 6.5v12c0 4-2 8-5 10-2 1.3-4.5 1.5-7 .5-3-1.2-5-4.5-5-8V22z" fill="none" />
        {/* Toe bumps */}
        <ellipse cx="22" cy="13" rx="4" ry="2.5" fill="none" />
        <ellipse cx="28" cy="14" rx="3" ry="2" fill="none" />
        {/* Inner sole detail */}
        <path d="M19 24c1-1 4-1.5 6 0" opacity="0.3" fill="none" />
        <path d="M18 32c1.5 1 5 1 7 0" opacity="0.3" fill="none" />
      </g>
      {/* Question mark — pulsing */}
      <g style={{ transformOrigin: "48px 28px", animation: `${id}-qpulse 2s ease-in-out infinite` }}>
        <path d="M43 18c0-3.5 2.5-6 6-6s6 2.5 6 6c0 2.5-1.5 4-3.5 5-1 .5-1.5 1.2-1.5 2.5v1.5" fill="none" strokeWidth="2.5" />
        <circle cx="50" cy="32" r="1.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}
