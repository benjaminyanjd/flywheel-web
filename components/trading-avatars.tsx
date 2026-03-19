"use client";

import React from "react";

interface AvatarProps {
  size?: number;
  className?: string;
}

// ── Surfer: 流动波浪曲线 + 动态箭头，表达"顺势而为" ──────────────
export function SurferAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="surfer-bg" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.22"/>
          <stop offset="50%" stopColor="var(--signal)" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="surfer-wave1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.1"/>
          <stop offset="30%" stopColor="var(--signal-light)" stopOpacity="0.4"/>
          <stop offset="60%" stopColor="var(--signal-light)" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="var(--signal-light)" stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id="surfer-wave2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.15"/>
          <stop offset="35%" stopColor="var(--signal)" stopOpacity="0.6"/>
          <stop offset="65%" stopColor="var(--signal-light)" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="surfer-wave-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </linearGradient>
        <linearGradient id="surfer-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.7"/>
          <stop offset="50%" stopColor="var(--signal-amber-light)"/>
          <stop offset="100%" stopColor="var(--signal-amber-light)" stopOpacity="0.9"/>
        </linearGradient>
        <filter id="surfer-glow">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="surfer-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal)" floodOpacity="0.2"/>
        </filter>
        <filter id="surfer-texture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
          <feBlend in="SourceGraphic" in2="gray" mode="soft-light"/>
        </filter>
      </defs>

      {/* Outer boundary */}
      <circle cx="100" cy="100" r="96" fill="url(#surfer-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>
      <circle cx="100" cy="100" r="93" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="2 6"/>

      {/* Deep background wave fill — layered for depth */}
      <path d="M20 130 Q50 110 80 125 Q110 140 140 120 Q165 103 180 112 L180 175 L20 175 Z"
        fill="url(#surfer-wave-fill)" filter="url(#surfer-texture)"/>

      {/* Wave 3 — back (faint) */}
      <path d="M20 138 Q45 122 75 133 Q105 144 135 128 Q158 115 180 122"
        stroke="var(--signal-light)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.2"/>

      {/* Wave 2 — mid */}
      <path d="M20 118 Q48 100 82 114 Q114 128 148 108 Q166 97 180 104"
        stroke="url(#surfer-wave1)" strokeWidth="2.5" strokeLinecap="round" fill="none" filter="url(#surfer-shadow)"/>

      {/* Wave 1 — front, bold with glow */}
      <path d="M20 102 Q52 82 88 98 Q120 113 156 90 Q170 81 180 86"
        stroke="url(#surfer-wave2)" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#surfer-glow)"/>

      {/* Wave crest sparkle — gem-like */}
      <circle cx="88" cy="98" r="5" fill="var(--signal-light)" fillOpacity="0.15" filter="url(#surfer-glow)"/>
      <circle cx="88" cy="98" r="3" fill="var(--signal-light)" fillOpacity="0.85"/>
      <ellipse cx="87" cy="96" rx="1.5" ry="1" fill="white" fillOpacity="0.5"/>
      <circle cx="156" cy="90" r="2.5" fill="var(--signal-light)" fillOpacity="0.7"/>
      <ellipse cx="155" cy="89" rx="1" ry="0.6" fill="white" fillOpacity="0.4"/>

      {/* Trend arrow — diagonal upward with shadow */}
      <path d="M38 152 L72 118 L100 132 L140 88"
        stroke="url(#surfer-arrow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#surfer-glow)"/>
      {/* Arrow head — refined */}
      <path d="M132 82 L148 84 L140 98" fill="url(#surfer-arrow)" filter="url(#surfer-shadow)"/>
      <path d="M134 85 L144 86 L139 94" fill="var(--signal-amber-light)" fillOpacity="0.5"/>

      {/* Small momentum arrows */}
      <path d="M55 75 L65 65 L75 72" stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.5"/>
      <path d="M70 62 L78 53 L86 60" stroke="var(--signal-amber-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.3"/>

      {/* Speed rings — more elegant */}
      <ellipse cx="88" cy="98" rx="14" ry="6" stroke="var(--signal-light)" strokeWidth="0.75" fill="none" strokeOpacity="0.25" strokeDasharray="3 3"/>
      <ellipse cx="88" cy="98" rx="22" ry="9" stroke="var(--signal)" strokeWidth="0.5" fill="none" strokeOpacity="0.12" strokeDasharray="2 5"/>

      {/* Ambient particles */}
      <circle cx="45" cy="65" r="1.2" fill="var(--signal-light)" fillOpacity="0.35"/>
      <circle cx="165" cy="72" r="1" fill="var(--signal-light)" fillOpacity="0.25"/>
      <circle cx="120" cy="55" r="0.8" fill="var(--signal-amber-light)" fillOpacity="0.3"/>
    </svg>
  );
}

// ── Sniper: 精准十字准星 + 同心圆 + 锐利线条，表达"精确瞄准" ──────
export function SniperAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sniper-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.18"/>
          <stop offset="40%" stopColor="var(--signal)" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <radialGradient id="sniper-center" cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
          <stop offset="30%" stopColor="var(--signal-amber-light)" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="var(--signal-amber)"/>
        </radialGradient>
        <linearGradient id="sniper-line-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.08"/>
          <stop offset="40%" stopColor="var(--signal)" stopOpacity="0.7"/>
          <stop offset="48%" stopColor="var(--signal-light)" stopOpacity="0.3"/>
          <stop offset="50%" stopColor="var(--signal-amber)" stopOpacity="0.0"/>
          <stop offset="52%" stopColor="var(--signal-light)" stopOpacity="0.3"/>
          <stop offset="60%" stopColor="var(--signal)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id="sniper-line-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.08"/>
          <stop offset="40%" stopColor="var(--signal)" stopOpacity="0.7"/>
          <stop offset="48%" stopColor="var(--signal-light)" stopOpacity="0.3"/>
          <stop offset="50%" stopColor="var(--signal-amber)" stopOpacity="0.0"/>
          <stop offset="52%" stopColor="var(--signal-light)" stopOpacity="0.3"/>
          <stop offset="60%" stopColor="var(--signal)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.08"/>
        </linearGradient>
        <radialGradient id="sniper-ring-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0"/>
        </radialGradient>
        <filter id="sniper-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sniper-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="var(--signal-amber)" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Outer boundary — double ring */}
      <circle cx="100" cy="100" r="96" fill="url(#sniper-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>
      <circle cx="100" cy="100" r="93" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="2 6"/>

      {/* Ambient glow behind rings */}
      <circle cx="100" cy="100" r="50" fill="url(#sniper-ring-glow)"/>

      {/* Concentric rings — progressive refinement */}
      <circle cx="100" cy="100" r="78" stroke="var(--signal)" strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="6 4"/>
      <circle cx="100" cy="100" r="62" stroke="var(--signal)" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="4 3"/>
      <circle cx="100" cy="100" r="46" stroke="var(--signal)" strokeWidth="1.2" strokeOpacity="0.4"/>
      <circle cx="100" cy="100" r="30" stroke="var(--signal-light)" strokeWidth="1.5" strokeOpacity="0.55" filter="url(#sniper-shadow)"/>
      <circle cx="100" cy="100" r="16" stroke="var(--signal-amber)" strokeWidth="2" strokeOpacity="0.85" filter="url(#sniper-glow)"/>

      {/* Crosshair horizontal */}
      <line x1="18" y1="100" x2="182" y2="100" stroke="url(#sniper-line-h)" strokeWidth="1.2"/>
      {/* Crosshair vertical */}
      <line x1="100" y1="18" x2="100" y2="182" stroke="url(#sniper-line-v)" strokeWidth="1.2"/>

      {/* Tick marks — refined */}
      <line x1="100" y1="34" x2="100" y2="42" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="100" y1="158" x2="100" y2="166" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="34" y1="100" x2="42" y2="100" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="158" y1="100" x2="166" y2="100" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
      {/* Secondary ticks */}
      <line x1="100" y1="52" x2="100" y2="56" stroke="var(--signal)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="100" y1="144" x2="100" y2="148" stroke="var(--signal)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="52" y1="100" x2="56" y2="100" stroke="var(--signal)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="144" y1="100" x2="148" y2="100" stroke="var(--signal)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3"/>

      {/* Center dot — gem-like with specular */}
      <circle cx="100" cy="100" r="6" fill="url(#sniper-center)" filter="url(#sniper-glow)"/>
      <circle cx="100" cy="100" r="3" fill="white" fillOpacity="0.85"/>
      <ellipse cx="98" cy="98" rx="1.5" ry="1" fill="white" fillOpacity="0.6"/>

      {/* Diagonal precision lines */}
      <path d="M34 34 L52 52" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="2 2"/>
      <path d="M166 34 L148 52" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="2 2"/>
      <path d="M34 166 L52 148" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="2 2"/>
      <path d="M166 166 L148 148" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="2 2"/>

      {/* Corner brackets — with shadow */}
      <path d="M22 22 L22 38 L38 38" stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.7" filter="url(#sniper-shadow)"/>
      <path d="M178 22 L178 38 L162 38" stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.7" filter="url(#sniper-shadow)"/>
      <path d="M22 178 L22 162 L38 162" stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.7" filter="url(#sniper-shadow)"/>
      <path d="M178 178 L178 162 L162 162" stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.7" filter="url(#sniper-shadow)"/>
    </svg>
  );
}

// ── Turtle: 六边形盾牌 + 稳固几何堆叠，表达"稳健防御" ──────────────
export function TurtleAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Background gradient — deeper, more layered */}
        <radialGradient id="turtle-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.22"/>
          <stop offset="50%" stopColor="var(--signal)" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>

        {/* Main shield — metallic gradient with multiple stops */}
        <linearGradient id="turtle-shield" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.6"/>
          <stop offset="35%" stopColor="var(--signal)" stopOpacity="0.4"/>
          <stop offset="50%" stopColor="var(--signal-light)" stopOpacity="0.55"/>
          <stop offset="75%" stopColor="var(--signal)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.15"/>
        </linearGradient>

        {/* Inner hex — glass-like */}
        <linearGradient id="turtle-hex-fill" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.45"/>
          <stop offset="40%" stopColor="var(--signal)" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.08"/>
        </linearGradient>

        {/* Core hex — rich gradient */}
        <linearGradient id="turtle-core" x1="30%" y1="10%" x2="70%" y2="90%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.5"/>
          <stop offset="50%" stopColor="var(--signal)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.2"/>
        </linearGradient>

        {/* Center gem gradient */}
        <radialGradient id="turtle-gem" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.95"/>
          <stop offset="40%" stopColor="var(--signal-light)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.4"/>
        </radialGradient>

        {/* Micro noise texture */}
        <filter id="turtle-texture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
          <feBlend in="SourceGraphic" in2="gray" mode="soft-light"/>
        </filter>

        {/* Drop shadow for depth */}
        <filter id="turtle-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="var(--signal)" floodOpacity="0.25"/>
        </filter>

        {/* Soft glow */}
        <filter id="turtle-glow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Bright inner glow */}
        <filter id="turtle-inner-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer boundary with subtle double-ring */}
      <circle cx="100" cy="100" r="96" fill="url(#turtle-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>
      <circle cx="100" cy="100" r="93" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="2 6"/>

      {/* Large center hexagon — main shield with shadow + texture */}
      <polygon points="100,28 152,58 152,118 100,148 48,118 48,58"
        fill="url(#turtle-shield)" filter="url(#turtle-shadow)"/>
      <polygon points="100,28 152,58 152,118 100,148 48,118 48,58"
        fill="none" stroke="var(--signal-light)" strokeWidth="1.5" strokeOpacity="0.5"/>
      {/* Outer hex highlight edge (top half brighter) */}
      <path d="M100,28 L152,58 L152,88" stroke="var(--signal-light)" strokeWidth="1" strokeOpacity="0.35" fill="none"/>
      <path d="M100,28 L48,58 L48,88" stroke="var(--signal-light)" strokeWidth="1" strokeOpacity="0.25" fill="none"/>

      {/* Inner hexagon ring — glass effect */}
      <polygon points="100,46 138,68 138,112 100,134 62,112 62,68"
        fill="url(#turtle-hex-fill)" filter="url(#turtle-texture)"/>
      <polygon points="100,46 138,68 138,112 100,134 62,112 62,68"
        fill="none" stroke="var(--signal-light)" strokeWidth="1" strokeOpacity="0.45"/>
      {/* Specular highlight on inner hex — top edge */}
      <path d="M100,46 L138,68" stroke="white" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>

      {/* Core hexagon — richer fill */}
      <polygon points="100,62 124,76 124,104 100,118 76,104 76,76"
        fill="url(#turtle-core)" filter="url(#turtle-inner-glow)"/>
      <polygon points="100,62 124,76 124,104 100,118 76,104 76,76"
        fill="none" stroke="var(--signal-light)" strokeWidth="1.5" strokeOpacity="0.7"/>

      {/* Center gem — radial with highlight */}
      <polygon points="100,74 112,90 100,106 88,90"
        fill="url(#turtle-gem)" filter="url(#turtle-glow)"/>
      <polygon points="100,80 107,90 100,100 93,90"
        fill="var(--signal-light)" fillOpacity="0.85"/>
      {/* Gem specular spot */}
      <ellipse cx="97" cy="84" rx="4" ry="2.5" fill="white" fillOpacity="0.45"/>

      {/* Corner accent hexagons — with subtle gradient */}
      <polygon points="100,162 112,169 112,183 100,190 88,183 88,169"
        fill="var(--signal)" fillOpacity="0.12" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.25"/>
      <polygon points="40,128 52,135 52,149 40,156 28,149 28,135"
        fill="var(--signal)" fillOpacity="0.08" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>
      <polygon points="160,128 172,135 172,149 160,156 148,149 148,135"
        fill="var(--signal)" fillOpacity="0.08" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>

      {/* Top accent node — gem-like */}
      <polygon points="100,14 108,18 108,26 100,30 92,26 92,18"
        fill="var(--signal-amber)" fillOpacity="0.5" stroke="var(--signal-amber)" strokeWidth="1" strokeOpacity="0.6"/>
      <ellipse cx="100" cy="20" rx="3" ry="1.5" fill="white" fillOpacity="0.3"/>

      {/* Structural lines — thinner, more elegant */}
      <line x1="100" y1="62" x2="48" y2="58" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="2 4"/>
      <line x1="100" y1="62" x2="152" y2="58" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="2 4"/>
      <line x1="100" y1="118" x2="48" y2="118" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="2 4"/>
      <line x1="100" y1="118" x2="152" y2="118" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="2 4"/>

      {/* Subtle hex grid pattern in background */}
      <polygon points="68,38 78,44 78,52 68,56 58,52 58,44"
        fill="none" stroke="var(--signal)" strokeWidth="0.4" strokeOpacity="0.1"/>
      <polygon points="132,38 142,44 142,52 132,56 122,52 122,44"
        fill="none" stroke="var(--signal)" strokeWidth="0.4" strokeOpacity="0.1"/>
      <polygon points="38,86 48,92 48,100 38,104 28,100 28,92"
        fill="none" stroke="var(--signal)" strokeWidth="0.4" strokeOpacity="0.08"/>
      <polygon points="162,86 172,92 172,100 162,104 152,100 152,92"
        fill="none" stroke="var(--signal)" strokeWidth="0.4" strokeOpacity="0.08"/>
    </svg>
  );
}

// ── Rocket: 向上三角/菱形 + 发射轨迹 + 粒子效果，表达"快速上升" ─────
export function RocketAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rocket-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.22"/>
          <stop offset="50%" stopColor="var(--signal)" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="rocket-body" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber-light)" stopOpacity="0.95"/>
          <stop offset="30%" stopColor="var(--signal-amber-light)"/>
          <stop offset="60%" stopColor="var(--signal-amber)" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="rocket-body-highlight" x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2"/>
          <stop offset="40%" stopColor="white" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="rocket-trail" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="var(--signal-amber)" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="rocket-fin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="rocket-chart" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.2"/>
          <stop offset="50%" stopColor="var(--signal-light)" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="var(--signal-light)" stopOpacity="0.8"/>
        </linearGradient>
        <filter id="rocket-glow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="rocket-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="var(--signal-amber)" floodOpacity="0.3"/>
        </filter>
        <filter id="rocket-glow-sm">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer boundary */}
      <circle cx="100" cy="100" r="96" fill="url(#rocket-bg)" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2"/>
      <circle cx="100" cy="100" r="93" stroke="var(--signal-amber-light)" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="2 6"/>

      {/* Background chart line */}
      <path d="M30 160 L58 138 L80 148 L110 118 L135 126 L170 90"
        stroke="url(#rocket-chart)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="4 2"/>

      {/* Exhaust trail — layered for depth */}
      <path d="M100 155 Q90 172 85 186 L100 176 L115 186 Q110 172 100 155 Z"
        fill="url(#rocket-trail)" filter="url(#rocket-glow)"/>
      <path d="M100 150 Q93 164 88 176 L100 168 L112 176 Q107 164 100 150 Z"
        fill="var(--signal-amber-light)" fillOpacity="0.5"/>
      <path d="M100 146 L96 158 L100 154 L104 158 Z"
        fill="white" fillOpacity="0.45"/>

      {/* Main rocket body — with shadow */}
      <polygon points="100,30 130,90 100,118 70,90"
        fill="url(#rocket-body)" filter="url(#rocket-shadow)"/>
      {/* Body highlight overlay */}
      <polygon points="100,30 130,90 100,118 70,90"
        fill="url(#rocket-body-highlight)"/>
      {/* Body edge highlight */}
      <path d="M100,30 L70,90" stroke="var(--signal-amber-light)" strokeWidth="0.75" strokeOpacity="0.4" fill="none"/>

      {/* Inner diamond highlight */}
      <polygon points="100,46 118,86 100,104 82,86"
        fill="var(--signal-amber-light)" fillOpacity="0.25"/>
      <polygon points="100,58 112,84 100,96 88,84"
        fill="white" fillOpacity="0.1"/>
      {/* Specular */}
      <ellipse cx="95" cy="65" rx="6" ry="3" fill="white" fillOpacity="0.15"/>

      {/* Side fins — with gradient */}
      <polygon points="70,90 50,112 76,112" fill="url(#rocket-fin)"/>
      <polygon points="130,90 150,112 124,112" fill="url(#rocket-fin)"/>
      {/* Fin edge highlights */}
      <path d="M70,90 L50,112" stroke="var(--signal-amber-light)" strokeWidth="0.5" strokeOpacity="0.3" fill="none"/>
      <path d="M130,90 L150,112" stroke="var(--signal-amber-light)" strokeWidth="0.5" strokeOpacity="0.3" fill="none"/>

      {/* Speed rings */}
      <ellipse cx="100" cy="90" rx="22" ry="8" stroke="var(--signal-amber-light)" strokeWidth="0.75" fill="none" strokeOpacity="0.25" strokeDasharray="3 3"/>
      <ellipse cx="100" cy="90" rx="36" ry="14" stroke="var(--signal-amber)" strokeWidth="0.5" fill="none" strokeOpacity="0.15" strokeDasharray="2 4"/>

      {/* Particle dots — varied opacity */}
      <circle cx="52" cy="72" r="2" fill="var(--signal-amber-light)" fillOpacity="0.6" filter="url(#rocket-glow-sm)"/>
      <circle cx="44" cy="90" r="1.2" fill="var(--signal-amber)" fillOpacity="0.4"/>
      <circle cx="148" cy="68" r="1.8" fill="var(--signal-amber-light)" fillOpacity="0.55" filter="url(#rocket-glow-sm)"/>
      <circle cx="158" cy="85" r="1.2" fill="var(--signal-amber)" fillOpacity="0.4"/>
      <circle cx="165" cy="54" r="1" fill="var(--signal-amber-light)" fillOpacity="0.3"/>
      <circle cx="38" cy="55" r="1" fill="var(--signal-amber)" fillOpacity="0.3"/>
      <circle cx="68" cy="45" r="0.8" fill="var(--signal-light)" fillOpacity="0.4"/>
      <circle cx="132" cy="42" r="0.8" fill="var(--signal-light)" fillOpacity="0.4"/>
    </svg>
  );
}

// ── Whale: 大面积圆形 + 深度波纹 + 重力感，表达"大资金量级" ──────────
export function WhaleAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="whale-bg" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.24"/>
          <stop offset="50%" stopColor="var(--signal)" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <radialGradient id="whale-core" cx="42%" cy="40%" r="50%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.7"/>
          <stop offset="35%" stopColor="var(--signal-light)" stopOpacity="0.5"/>
          <stop offset="70%" stopColor="var(--signal)" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.15"/>
        </radialGradient>
        <radialGradient id="whale-mid" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.35"/>
          <stop offset="60%" stopColor="var(--signal)" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.03"/>
        </radialGradient>
        <linearGradient id="whale-bar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.15"/>
        </linearGradient>
        <filter id="whale-glow">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="whale-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--signal)" floodOpacity="0.2"/>
        </filter>
        <filter id="whale-glow-sm">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer boundary */}
      <circle cx="100" cy="100" r="96" fill="url(#whale-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>
      <circle cx="100" cy="100" r="93" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="2 6"/>

      {/* Depth ripple rings — progressive */}
      <circle cx="100" cy="110" r="84" stroke="var(--signal)" strokeWidth="0.6" strokeOpacity="0.08" strokeDasharray="8 5"/>
      <circle cx="100" cy="108" r="70" stroke="var(--signal)" strokeWidth="0.8" strokeOpacity="0.14" strokeDasharray="6 4"/>
      <circle cx="100" cy="106" r="56" stroke="var(--signal)" strokeWidth="1" strokeOpacity="0.22" strokeDasharray="4 3"/>
      <circle cx="100" cy="104" r="42" stroke="var(--signal-light)" strokeWidth="1.2" strokeOpacity="0.32" filter="url(#whale-glow-sm)"/>
      <circle cx="100" cy="102" r="28" stroke="var(--signal-light)" strokeWidth="1.5" strokeOpacity="0.45" filter="url(#whale-glow-sm)"/>

      {/* Main mass circle — with shadow */}
      <circle cx="100" cy="100" r="52" fill="url(#whale-mid)" filter="url(#whale-shadow)"/>

      {/* Core bright circle — gem-like */}
      <circle cx="100" cy="98" r="34" fill="url(#whale-core)" filter="url(#whale-glow)"/>

      {/* Inner highlight — specular */}
      <circle cx="100" cy="95" r="20" fill="var(--signal-light)" fillOpacity="0.15"/>
      <ellipse cx="90" cy="86" rx="10" ry="6" fill="var(--signal-light)" fillOpacity="0.2"/>
      <ellipse cx="88" cy="84" rx="5" ry="3" fill="white" fillOpacity="0.2"/>

      {/* Capital weight indicator — gradient bars */}
      <rect x="64" y="158" width="72" height="6" rx="3" fill="url(#whale-bar)"/>
      <rect x="72" y="168" width="56" height="4" rx="2" fill="url(#whale-bar)" opacity="0.7"/>
      <rect x="82" y="176" width="36" height="3" rx="1.5" fill="url(#whale-bar)" opacity="0.4"/>

      {/* Volume bars — flanking with gradient */}
      <rect x="28" y="125" width="10" height="30" rx="2" fill="url(#whale-bar)" opacity="0.5"/>
      <rect x="42" y="115" width="10" height="40" rx="2" fill="url(#whale-bar)" opacity="0.65"/>
      <rect x="148" y="118" width="10" height="37" rx="2" fill="url(#whale-bar)" opacity="0.6"/>
      <rect x="162" y="128" width="10" height="27" rx="2" fill="url(#whale-bar)" opacity="0.45"/>
      {/* Bar top highlights */}
      <rect x="42" y="115" width="10" height="2" rx="1" fill="var(--signal-light)" fillOpacity="0.3"/>
      <rect x="148" y="118" width="10" height="2" rx="1" fill="var(--signal-light)" fillOpacity="0.25"/>

      {/* Gravity drop lines — refined */}
      <line x1="100" y1="155" x2="100" y2="170" stroke="var(--signal-light)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="78" y1="148" x2="74" y2="158" stroke="var(--signal-light)" strokeWidth="0.75" strokeLinecap="round" strokeOpacity="0.2"/>
      <line x1="122" y1="148" x2="126" y2="158" stroke="var(--signal-light)" strokeWidth="0.75" strokeLinecap="round" strokeOpacity="0.2"/>
    </svg>
  );
}

// ── Ninja: 锐角星形/手里剑 + 速度线 + 闪电，表达"快进快出" ──────────
export function NinjaAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ninja-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.15"/>
          <stop offset="50%" stopColor="var(--signal)" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="ninja-star1" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.85"/>
          <stop offset="40%" stopColor="var(--signal-light)" stopOpacity="0.6"/>
          <stop offset="70%" stopColor="var(--signal)" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="ninja-star2" x1="80%" y1="0%" x2="20%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber-light)" stopOpacity="0.7"/>
          <stop offset="50%" stopColor="var(--signal-amber)" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0.25"/>
        </linearGradient>
        <linearGradient id="ninja-lightning" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber-light)" stopOpacity="0.95"/>
          <stop offset="60%" stopColor="var(--signal-amber)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="ninja-speed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0"/>
          <stop offset="50%" stopColor="var(--signal)" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.08"/>
        </linearGradient>
        <filter id="ninja-glow">
          <feGaussianBlur stdDeviation="4.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ninja-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal)" floodOpacity="0.2"/>
        </filter>
        <filter id="ninja-glow-sm">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer boundary */}
      <circle cx="100" cy="100" r="96" fill="url(#ninja-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>
      <circle cx="100" cy="100" r="93" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="2 6"/>

      {/* Speed lines — gradient streaks */}
      <line x1="18" y1="78" x2="58" y2="78" stroke="url(#ninja-speed)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="88" x2="48" y2="88" stroke="url(#ninja-speed)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="18" y1="98" x2="52" y2="98" stroke="url(#ninja-speed)" strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="142" y1="100" x2="182" y2="100" stroke="url(#ninja-speed)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="148" y1="112" x2="182" y2="112" stroke="url(#ninja-speed)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="152" y1="122" x2="182" y2="122" stroke="url(#ninja-speed)" strokeWidth="0.8" strokeLinecap="round"/>

      {/* Outer ring */}
      <circle cx="100" cy="100" r="68" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.12" strokeDasharray="3 4"/>

      {/* Main 8-pointed shuriken star — with shadow */}
      <path d="
        M100 30 L110 88 L158 78 L112 100
        L158 122 L110 112 L100 170
        L90 112 L42 122 L88 100
        L42 78 L90 88 Z
      " fill="url(#ninja-star1)" filter="url(#ninja-shadow)"/>
      {/* Star edge highlight */}
      <path d="M100 30 L110 88 L158 78" stroke="var(--signal-light)" strokeWidth="0.5" strokeOpacity="0.3" fill="none"/>

      {/* Second star — rotated 45° */}
      <path d="
        M100 42 L108 86 L148 68 L108 96
        L148 130 L108 114 L100 158
        L92 114 L52 130 L92 96
        L52 68 L92 86 Z
      " fill="url(#ninja-star2)"/>

      {/* Inner bright core — gem-like */}
      <circle cx="100" cy="100" r="18" fill="var(--signal-light)" fillOpacity="0.4" filter="url(#ninja-glow)"/>
      <circle cx="100" cy="100" r="10" fill="var(--signal-light)" fillOpacity="0.75"/>
      <circle cx="100" cy="100" r="5" fill="white" fillOpacity="0.65"/>
      {/* Specular */}
      <ellipse cx="97" cy="97" rx="3" ry="2" fill="white" fillOpacity="0.4"/>

      {/* Lightning bolt — left side with glow */}
      <path d="M60 46 L50 72 L62 70 L48 98"
        stroke="url(#ninja-lightning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none" filter="url(#ninja-glow-sm)"/>

      {/* Lightning bolt — right side */}
      <path d="M148 58 L140 78 L150 76 L138 100"
        stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none" strokeOpacity="0.5" filter="url(#ninja-glow-sm)"/>

      {/* Accent diamonds — with gem highlight */}
      <polygon points="100,22 104,30 100,38 96,30" fill="var(--signal-light)" fillOpacity="0.75"/>
      <ellipse cx="100" cy="28" rx="1.5" ry="1" fill="white" fillOpacity="0.4"/>
      <polygon points="100,162 104,170 100,178 96,170" fill="var(--signal-light)" fillOpacity="0.5"/>
      <polygon points="22,100 30,104 38,100 30,96" fill="var(--signal-amber)" fillOpacity="0.6"/>
      <polygon points="162,100 170,104 178,100 170,96" fill="var(--signal-amber)" fillOpacity="0.5"/>
    </svg>
  );
}

export const AVATAR_MAP: Record<string, React.FC<AvatarProps>> = {
  surfer: SurferAvatar,
  sniper: SniperAvatar,
  turtle: TurtleAvatar,
  rocket: RocketAvatar,
  whale: WhaleAvatar,
  ninja: NinjaAvatar,
};

export const AVATAR_META: Record<string, { label: string; color: string; desc: string }> = {
  surfer: { label: "趨勢衝浪者", color: "var(--signal-light)", desc: "追逐趨勢，乘浪而行" },
  sniper: { label: "精準狙擊手", color: "var(--signal-amber)", desc: "精準進出，一擊致勝" },
  turtle: { label: "穩健套利者", color: "var(--signal)", desc: "穩健低風險，細水長流" },
  rocket: { label: "火箭追擊手", color: "var(--signal-amber-light)", desc: "高風險高回報，全力爆發" },
  whale: { label: "市場鯨魚", color: "var(--text-secondary)", desc: "大資金玩家，掌控市場" },
  ninja: { label: "閃電忍者", color: "var(--text-primary)", desc: "快進快出，神出鬼沒" },
};
