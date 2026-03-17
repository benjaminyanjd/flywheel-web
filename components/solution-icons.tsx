"use client"

import { useId } from "react"

function esc(s: string) {
  return s.replace(/:/g, "\\:")
}

/** Card ① — Person silhouette + gear */
export function ProfileGearIcon() {
  const id = esc(useId())
  const spin = `${id}-spin`
  const pulse = `${id}-pulse`

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ${spin}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ${pulse}{0%,100%{opacity:0.12;r:17}50%{opacity:0.3;r:20}}
      `}</style>
      {/* Glow behind person */}
      <circle cx="26" cy="26" r="17" fill="currentColor" style={{ animation: `${pulse} 3s ease-in-out infinite`, opacity: 0.2 }} />
      {/* Head */}
      <circle cx="26" cy="18" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Shoulders */}
      <path d="M12 42c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Gear — bottom-right */}
      <g style={{ transformOrigin: "48px 48px", animation: `${spin} 6s linear infinite` }}>
        <circle cx="48" cy="48" r="5.5" stroke="currentColor" strokeWidth="2" fill="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
          const rad = (deg * Math.PI) / 180
          const x1 = 48 + 6.5 * Math.cos(rad)
          const y1 = 48 + 6.5 * Math.sin(rad)
          const x2 = 48 + 8.5 * Math.cos(rad)
          const y2 = 48 + 8.5 * Math.sin(rad)
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        })}
      </g>
    </svg>
  )
}

/** Card ② — Brain + neural nodes + lightning */
export function BrainNeuralIcon() {
  const id = esc(useId())
  const blink1 = `${id}-b1`
  const blink2 = `${id}-b2`
  const blink3 = `${id}-b3`
  const flash = `${id}-flash`

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ${blink1}{0%,30%,100%{opacity:0.2}15%{opacity:1}}
        @keyframes ${blink2}{0%,60%,100%{opacity:0.2}45%{opacity:1}}
        @keyframes ${blink3}{0%,90%,100%{opacity:0.2}75%{opacity:1}}
        @keyframes ${flash}{0%,70%,100%{opacity:0}75%,90%{opacity:1}}
      `}</style>
      {/* Brain outline — left hemisphere */}
      <path
        d="M32 13c-4 0-7.3 1.3-9.3 4-2.4 3.2-3.3 6.7-2.7 10.7.4 2.7-1.3 4.7-1.3 7.3 0 3.3 2 6 4.7 7.3 2 1.1 4.7 1.3 8.7 1.3"
        stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {/* Brain outline — right hemisphere */}
      <path
        d="M32 13c4 0 7.3 1.3 9.3 4 2.4 3.2 3.3 6.7 2.7 10.7-.4 2.7 1.3 4.7 1.3 7.3 0 3.3-2 6-4.7 7.3-2 1.1-4.7 1.3-8.7 1.3"
        stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {/* Center fold */}
      <path d="M32 16v26" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.5 2.5" opacity="0.4" />
      {/* Inner folds */}
      <path d="M24 24c2.7-1.3 5.3 0 8 1.3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M40 24c-2.7-1.3-5.3 0-8 1.3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M22.5 32c2 1.3 6.7 1.3 9.3-0.7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M41.5 32c-2.7 1.3-5.3-0.7-9.3-0.7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Neural nodes */}
      <circle cx="18" cy="37" r="2.7" fill="currentColor" style={{ animation: `${blink1} 2.5s ease-in-out infinite` }} />
      <circle cx="46" cy="37" r="2.7" fill="currentColor" style={{ animation: `${blink2} 2.5s ease-in-out infinite` }} />
      <circle cx="32" cy="49" r="2.7" fill="currentColor" style={{ animation: `${blink3} 2.5s ease-in-out infinite` }} />
      {/* Connection lines to nodes */}
      <line x1="21" y1="36" x2="25" y2="34.5" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <line x1="43" y1="36" x2="39" y2="34.5" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <line x1="32" y1="44" x2="32" y2="47" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      {/* Lightning bolt */}
      <path
        d="M49 10l-4 7h4l-4 7"
        stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: `${flash} 3s ease-in-out infinite` }}
      />
    </svg>
  )
}

/** Card ③ — Clipboard checklist + sequential check animation */
export function ClipboardCheckIcon() {
  const id = esc(useId())
  const check1 = `${id}-c1`
  const check2 = `${id}-c2`
  const check3 = `${id}-c3`

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ${check1}{0%,10%{stroke-dashoffset:14;opacity:0}15%,90%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:14;opacity:0}}
        @keyframes ${check2}{0%,30%{stroke-dashoffset:14;opacity:0}35%,90%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:14;opacity:0}}
        @keyframes ${check3}{0%,50%{stroke-dashoffset:14;opacity:0}55%,90%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:14;opacity:0}}
      `}</style>
      {/* Clipboard body */}
      <rect x="13" y="10" width="38" height="46" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Clipboard clip */}
      <path d="M25 10V7.5a7 7 0 0 1 14 0V10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="22" y="5" width="20" height="7" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Row 1 */}
      <line x1="30" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <path d="M20 24l2 2 4-4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="14" style={{ animation: `${check1} 3s ease-in-out infinite` }} />
      {/* Row 2 */}
      <line x1="30" y1="35" x2="44" y2="35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <path d="M20 35l2 2 4-4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="14" style={{ animation: `${check2} 3s ease-in-out infinite` }} />
      {/* Row 3 */}
      <line x1="30" y1="46" x2="44" y2="46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <path d="M20 46l2 2 4-4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="14" style={{ animation: `${check3} 3s ease-in-out infinite` }} />
    </svg>
  )
}
