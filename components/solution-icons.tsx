"use client"

import { useId } from "react"

/** Card ① — Person silhouette + gear */
export function ProfileGearIcon() {
  const id = useId()
  const spin = `${id}-spin`
  const pulse = `${id}-pulse`

  return (
    <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ${spin}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes ${pulse}{0%,100%{opacity:0.12;r:13}50%{opacity:0.3;r:15}}
      `}</style>
      {/* Glow behind person */}
      <circle cx="20" cy="20" r="13" fill="currentColor" style={{ animation: `${pulse} 3s ease-in-out infinite` }} />
      {/* Head */}
      <circle cx="20" cy="14" r="5.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      {/* Shoulders */}
      <path d="M9 32c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Gear — bottom-right */}
      <g style={{ transformOrigin: "36px 36px", animation: `${spin} 6s linear infinite` }}>
        <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
          const rad = (deg * Math.PI) / 180
          const x1 = 36 + 4.8 * Math.cos(rad)
          const y1 = 36 + 4.8 * Math.sin(rad)
          const x2 = 36 + 6.5 * Math.cos(rad)
          const y2 = 36 + 6.5 * Math.sin(rad)
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        })}
      </g>
    </svg>
  )
}

/** Card ② — Brain + neural nodes + lightning */
export function BrainNeuralIcon() {
  const id = useId()
  const blink1 = `${id}-b1`
  const blink2 = `${id}-b2`
  const blink3 = `${id}-b3`
  const flash = `${id}-flash`

  return (
    <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ${blink1}{0%,30%,100%{opacity:0.2}15%{opacity:1}}
        @keyframes ${blink2}{0%,60%,100%{opacity:0.2}45%{opacity:1}}
        @keyframes ${blink3}{0%,90%,100%{opacity:0.2}75%{opacity:1}}
        @keyframes ${flash}{0%,70%,100%{opacity:0}75%,90%{opacity:1}}
      `}</style>
      {/* Brain outline — left hemisphere */}
      <path
        d="M24 10c-3 0-5.5 1-7 3-1.8 2.4-2.5 5-2 8 .3 2-1 3.5-1 5.5 0 2.5 1.5 4.5 3.5 5.5 1.5.8 3.5 1 6.5 1"
        stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"
      />
      {/* Brain outline — right hemisphere */}
      <path
        d="M24 10c3 0 5.5 1 7 3 1.8 2.4 2.5 5 2 8-.3 2 1 3.5 1 5.5 0 2.5-1.5 4.5-3.5 5.5-1.5.8-3.5 1-6.5 1"
        stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"
      />
      {/* Center fold */}
      <path d="M24 12v20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
      {/* Inner folds */}
      <path d="M18 18c2-1 4 0 6 1" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M30 18c-2-1-4 0-6 1" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M17 24c2 1 4-0.5 7-0.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M31 24c-2 1-4-0.5-7-0.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Neural nodes */}
      <circle cx="14" cy="28" r="2" fill="currentColor" style={{ animation: `${blink1} 2.5s ease-in-out infinite` }} />
      <circle cx="34" cy="28" r="2" fill="currentColor" style={{ animation: `${blink2} 2.5s ease-in-out infinite` }} />
      <circle cx="24" cy="37" r="2" fill="currentColor" style={{ animation: `${blink3} 2.5s ease-in-out infinite` }} />
      {/* Connection lines to nodes */}
      <line x1="16" y1="27" x2="19" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="32" y1="27" x2="29" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="24" y1="33" x2="24" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Lightning bolt */}
      <path
        d="M37 8l-3 5h3l-3 5"
        stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: `${flash} 3s ease-in-out infinite` }}
      />
    </svg>
  )
}

/** Card ③ — Clipboard checklist + sequential check animation */
export function ClipboardCheckIcon() {
  const id = useId()
  const check1 = `${id}-c1`
  const check2 = `${id}-c2`
  const check3 = `${id}-c3`

  return (
    <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes ${check1}{0%,10%{stroke-dashoffset:12;opacity:0}15%,90%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:12;opacity:0}}
        @keyframes ${check2}{0%,30%{stroke-dashoffset:12;opacity:0}35%,90%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:12;opacity:0}}
        @keyframes ${check3}{0%,50%{stroke-dashoffset:12;opacity:0}55%,90%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:12;opacity:0}}
      `}</style>
      {/* Clipboard body */}
      <rect x="10" y="8" width="28" height="34" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
      {/* Clipboard clip */}
      <path d="M19 8V6a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <rect x="17" y="4" width="14" height="5" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      {/* Row 1 */}
      <line x1="22" y1="18" x2="33" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M15 18l1.5 1.5L19.5 16" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12" style={{ animation: `${check1} 3s ease-in-out infinite` }} />
      {/* Row 2 */}
      <line x1="22" y1="26" x2="33" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M15 26l1.5 1.5L19.5 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12" style={{ animation: `${check2} 3s ease-in-out infinite` }} />
      {/* Row 3 */}
      <line x1="22" y1="34" x2="33" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M15 34l1.5 1.5L19.5 32" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="12" style={{ animation: `${check3} 3s ease-in-out infinite` }} />
    </svg>
  )
}
