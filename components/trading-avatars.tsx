"use client";

import React from "react";

interface AvatarProps {
  size?: number;
  className?: string;
}

// ── Surfer / Jesse Livermore: 1920s投機之王，油頭背梳、尖下巴、趨勢線背景 ──
export function SurferAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="surfer-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="surfer-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.4"/>
        </linearGradient>
        <linearGradient id="surfer-hair" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.5"/>
        </linearGradient>
        <filter id="surfer-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="surfer-shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal)" floodOpacity="0.2"/></filter>
      </defs>

      <circle cx="100" cy="100" r="96" fill="url(#surfer-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>

      {/* Background trend line */}
      <path d="M25 155 L55 140 L80 148 L110 120 L140 130 L175 85" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.15" strokeDasharray="4 3"/>

      {/* Shoulders/suit */}
      <path d="M52 170 Q60 148 78 140 L100 135 L122 140 Q140 148 148 170" fill="var(--signal)" fillOpacity="0.35"/>
      <path d="M52 170 Q60 148 78 140 L100 135 L122 140 Q140 148 148 170" fill="none" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.3"/>
      {/* Suit lapel lines */}
      <path d="M92 140 L96 158" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.3"/>
      <path d="M108 140 L104 158" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.3"/>
      {/* Tie */}
      <path d="M97 138 L100 142 L103 138 L101 162 L100 164 L99 162 Z" fill="var(--signal-amber)" fillOpacity="0.5"/>

      {/* Neck */}
      <rect x="92" y="126" width="16" height="14" rx="3" fill="url(#surfer-face)"/>

      {/* Head — oval */}
      <ellipse cx="100" cy="95" rx="30" ry="36" fill="url(#surfer-face)" filter="url(#surfer-shadow)"/>

      {/* Slicked-back hair — Livermore's signature */}
      <path d="M70 90 Q72 52 100 48 Q128 52 130 90 Q128 70 100 65 Q72 70 70 90 Z" fill="url(#surfer-hair)"/>
      {/* Hair highlight */}
      <path d="M82 60 Q100 54 118 60" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.4" fill="none"/>

      {/* Eyes */}
      <ellipse cx="87" cy="92" rx="5" ry="3" fill="var(--signal)" fillOpacity="0.7"/>
      <ellipse cx="113" cy="92" rx="5" ry="3" fill="var(--signal)" fillOpacity="0.7"/>
      <circle cx="88" cy="91.5" r="1.5" fill="var(--signal-light)" fillOpacity="0.9"/>
      <circle cx="114" cy="91.5" r="1.5" fill="var(--signal-light)" fillOpacity="0.9"/>

      {/* Eyebrows — sharp, confident */}
      <path d="M80 86 Q87 83 94 85" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.6"/>
      <path d="M106 85 Q113 83 120 86" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.6"/>

      {/* Nose */}
      <path d="M100 94 L98 106 Q100 108 102 106 L100 94" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.3" fill="none"/>

      {/* Mouth — slight confident smile */}
      <path d="M90 114 Q100 119 110 114" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>

      {/* Jaw definition */}
      <path d="M72 100 Q70 118 100 130 Q130 118 128 100" stroke="var(--signal)" strokeWidth="0.5" strokeOpacity="0.15" fill="none"/>

      {/* Ear hints */}
      <ellipse cx="69" cy="95" rx="4" ry="7" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
      <ellipse cx="131" cy="95" rx="4" ry="7" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
    </svg>
  );
}

// ── Sniper / George Soros: 年長智者、禿頂、大框眼鏡、深邃目光 ──────
export function SniperAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sniper-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="sniper-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber-light)" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0.35"/>
        </linearGradient>
        <filter id="sniper-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sniper-shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal-amber)" floodOpacity="0.15"/></filter>
      </defs>

      <circle cx="100" cy="100" r="96" fill="url(#sniper-bg)" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2"/>

      {/* Background crosshair hint */}
      <line x1="100" y1="10" x2="100" y2="190" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.08"/>
      <line x1="10" y1="100" x2="190" y2="100" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.08"/>

      {/* Shoulders/suit */}
      <path d="M48 175 Q58 150 78 142 L100 136 L122 142 Q142 150 152 175" fill="var(--signal-amber)" fillOpacity="0.25"/>
      <path d="M48 175 Q58 150 78 142 L100 136 L122 142 Q142 150 152 175" fill="none" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.25"/>
      {/* Tie */}
      <path d="M97 140 L100 145 L103 140 L101 164 L100 166 L99 164 Z" fill="var(--signal-amber)" fillOpacity="0.4"/>

      {/* Neck */}
      <rect x="92" y="126" width="16" height="14" rx="3" fill="url(#sniper-face)"/>

      {/* Head — slightly longer */}
      <ellipse cx="100" cy="92" rx="32" ry="38" fill="url(#sniper-face)" filter="url(#sniper-shadow)"/>

      {/* Bald top with side hair */}
      <path d="M68 95 Q68 72 72 65 Q68 60 70 52 Q80 45 100 43 Q120 45 130 52 Q132 60 128 65 Q132 72 132 95" fill="none" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.15"/>
      {/* Side hair — sparse */}
      <path d="M68 88 Q65 82 67 72 Q69 65 72 62" stroke="var(--signal-amber)" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>
      <path d="M132 88 Q135 82 133 72 Q131 65 128 62" stroke="var(--signal-amber)" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>

      {/* Large glasses — Soros' signature */}
      <rect x="76" y="85" width="20" height="16" rx="3" stroke="var(--signal-amber)" strokeWidth="1.5" strokeOpacity="0.7" fill="var(--signal-amber)" fillOpacity="0.08"/>
      <rect x="104" y="85" width="20" height="16" rx="3" stroke="var(--signal-amber)" strokeWidth="1.5" strokeOpacity="0.7" fill="var(--signal-amber)" fillOpacity="0.08"/>
      {/* Bridge */}
      <path d="M96 91 Q100 88 104 91" stroke="var(--signal-amber)" strokeWidth="1.2" strokeOpacity="0.6" fill="none"/>
      {/* Temples */}
      <line x1="76" y1="90" x2="68" y2="88" stroke="var(--signal-amber)" strokeWidth="1" strokeOpacity="0.5"/>
      <line x1="124" y1="90" x2="132" y2="88" stroke="var(--signal-amber)" strokeWidth="1" strokeOpacity="0.5"/>

      {/* Eyes behind glasses */}
      <ellipse cx="86" cy="93" rx="4" ry="2.5" fill="var(--signal-amber)" fillOpacity="0.6"/>
      <ellipse cx="114" cy="93" rx="4" ry="2.5" fill="var(--signal-amber)" fillOpacity="0.6"/>
      <circle cx="87" cy="92.5" r="1.2" fill="var(--signal-amber-light)" fillOpacity="0.9"/>
      <circle cx="115" cy="92.5" r="1.2" fill="var(--signal-amber-light)" fillOpacity="0.9"/>

      {/* Eyebrows — heavy, wise */}
      <path d="M78 83 Q86 79 96 82" stroke="var(--signal-amber)" strokeWidth="1.8" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>
      <path d="M104 82 Q114 79 122 83" stroke="var(--signal-amber)" strokeWidth="1.8" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>

      {/* Nose — prominent */}
      <path d="M100 96 L97 108 Q100 111 103 108 L100 96" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.3" fill="none"/>

      {/* Mouth — thin, determined */}
      <path d="M90 118 Q100 121 110 118" stroke="var(--signal-amber)" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.35"/>

      {/* Wrinkle lines — age/wisdom */}
      <path d="M75 108 Q73 112 75 116" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.15" fill="none"/>
      <path d="M125 108 Q127 112 125 116" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.15" fill="none"/>

      {/* Ear hints */}
      <ellipse cx="67" cy="93" rx="4" ry="8" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
      <ellipse cx="133" cy="93" rx="4" ry="8" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
    </svg>
  );
}

// ── Turtle / Benjamin Graham: 圓臉、圓框眼鏡、和善微笑、學者氣質 ──────
export function TurtleAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="turtle-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="turtle-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.65"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.35"/>
        </linearGradient>
        <filter id="turtle-shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal)" floodOpacity="0.2"/></filter>
      </defs>

      <circle cx="100" cy="100" r="96" fill="url(#turtle-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>

      {/* Background book/shield hint */}
      <rect x="72" y="165" width="56" height="6" rx="2" fill="var(--signal)" fillOpacity="0.1"/>
      <rect x="78" y="173" width="44" height="4" rx="1.5" fill="var(--signal)" fillOpacity="0.07"/>

      {/* Shoulders/suit — professorial */}
      <path d="M46 178 Q56 152 76 143 L100 137 L124 143 Q144 152 154 178" fill="var(--signal)" fillOpacity="0.3"/>
      <path d="M46 178 Q56 152 76 143 L100 137 L124 143 Q144 152 154 178" fill="none" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.25"/>
      {/* Bow tie */}
      <path d="M92 142 L100 146 L108 142 L100 140 Z" fill="var(--signal)" fillOpacity="0.5"/>

      {/* Neck */}
      <rect x="93" y="126" width="14" height="14" rx="3" fill="url(#turtle-face)"/>

      {/* Head — rounder, friendlier */}
      <ellipse cx="100" cy="92" rx="33" ry="37" fill="url(#turtle-face)" filter="url(#turtle-shadow)"/>

      {/* Hair — thin, receding */}
      <path d="M67 88 Q67 60 80 50 Q90 45 100 44 Q110 45 120 50 Q133 60 133 88" fill="none" stroke="var(--signal)" strokeWidth="2" strokeOpacity="0.35"/>
      <path d="M70 85 Q68 65 78 54" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.3"/>
      <path d="M130 85 Q132 65 122 54" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.3"/>

      {/* Round glasses — Graham's signature */}
      <circle cx="85" cy="92" r="12" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.6" fill="var(--signal)" fillOpacity="0.06"/>
      <circle cx="115" cy="92" r="12" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.6" fill="var(--signal)" fillOpacity="0.06"/>
      {/* Bridge */}
      <path d="M97 90 Q100 87 103 90" stroke="var(--signal)" strokeWidth="1.2" strokeOpacity="0.5" fill="none"/>
      {/* Temples */}
      <line x1="73" y1="89" x2="66" y2="87" stroke="var(--signal)" strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="127" y1="89" x2="134" y2="87" stroke="var(--signal)" strokeWidth="1" strokeOpacity="0.4"/>

      {/* Eyes — warm, kind */}
      <ellipse cx="85" cy="92" rx="4" ry="2.5" fill="var(--signal)" fillOpacity="0.6"/>
      <ellipse cx="115" cy="92" rx="4" ry="2.5" fill="var(--signal)" fillOpacity="0.6"/>
      <circle cx="86" cy="91.5" r="1.2" fill="var(--signal-light)" fillOpacity="0.85"/>
      <circle cx="116" cy="91.5" r="1.2" fill="var(--signal-light)" fillOpacity="0.85"/>

      {/* Eyebrows — gentle, arched */}
      <path d="M76 82 Q85 79 96 81" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>
      <path d="M104 81 Q115 79 124 82" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>

      {/* Nose */}
      <path d="M100 96 L98 107 Q100 110 102 107 L100 96" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.25" fill="none"/>

      {/* Mouth — warm smile */}
      <path d="M88 116 Q95 122 100 122 Q105 122 112 116" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.35"/>

      {/* Laugh lines */}
      <path d="M74 105 Q72 112 74 118" stroke="var(--signal)" strokeWidth="0.5" strokeOpacity="0.12" fill="none"/>
      <path d="M126 105 Q128 112 126 118" stroke="var(--signal)" strokeWidth="0.5" strokeOpacity="0.12" fill="none"/>

      {/* Ears */}
      <ellipse cx="66" cy="93" rx="4" ry="8" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
      <ellipse cx="134" cy="93" rx="4" ry="8" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
    </svg>
  );
}

// ── Rocket / Michael Burry: 短髮、一隻眼睛有義眼（左眼較小）、嚴肅、獨行者 ──
export function RocketAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rocket-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="rocket-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber-light)" stopOpacity="0.65"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0.35"/>
        </linearGradient>
        <filter id="rocket-shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal-amber)" floodOpacity="0.2"/></filter>
      </defs>

      <circle cx="100" cy="100" r="96" fill="url(#rocket-bg)" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2"/>

      {/* Background chart crash line */}
      <path d="M30 80 L55 78 L75 82 L90 75 L105 120 L120 155 L145 160 L170 158" stroke="var(--signal-amber)" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.1" strokeDasharray="3 3"/>

      {/* Shoulders — casual, hoodie-like */}
      <path d="M48 178 Q56 150 76 142 L100 136 L124 142 Q144 150 152 178" fill="var(--signal-amber)" fillOpacity="0.2"/>
      {/* T-shirt neckline */}
      <path d="M86 140 Q100 148 114 140" stroke="var(--signal-amber)" strokeWidth="1" strokeOpacity="0.3" fill="none"/>

      {/* Neck */}
      <rect x="92" y="126" width="16" height="14" rx="3" fill="url(#rocket-face)"/>

      {/* Head */}
      <ellipse cx="100" cy="92" rx="31" ry="37" fill="url(#rocket-face)" filter="url(#rocket-shadow)"/>

      {/* Short cropped hair */}
      <path d="M69 85 Q69 55 85 48 Q95 44 100 43 Q105 44 115 48 Q131 55 131 85" fill="var(--signal-amber)" fillOpacity="0.3"/>
      <path d="M72 82 Q72 58 88 50 Q100 46 112 50 Q128 58 128 82" fill="var(--signal-amber)" fillOpacity="0.15"/>

      {/* Left eye — glass eye, slightly smaller/different */}
      <ellipse cx="86" cy="92" rx="4.5" ry="3" fill="var(--signal-amber)" fillOpacity="0.5"/>
      <circle cx="86" cy="92" r="1.5" fill="var(--signal-amber)" fillOpacity="0.7"/>

      {/* Right eye — normal, intense */}
      <ellipse cx="114" cy="92" rx="5" ry="3" fill="var(--signal-amber)" fillOpacity="0.65"/>
      <circle cx="115" cy="91.5" r="1.5" fill="var(--signal-amber-light)" fillOpacity="0.9"/>

      {/* Eyebrows — furrowed, intense */}
      <path d="M78 84 Q86 80 94 83" stroke="var(--signal-amber)" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>
      <path d="M106 83 Q114 80 122 84" stroke="var(--signal-amber)" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>

      {/* Nose */}
      <path d="M100 95 L98 107 Q100 110 102 107 L100 95" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.3" fill="none"/>

      {/* Mouth — firm, determined */}
      <path d="M90 116 L110 116" stroke="var(--signal-amber)" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.35"/>

      {/* Stubble hint */}
      <path d="M82 120 Q100 128 118 120" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.1" fill="none" strokeDasharray="1 2"/>

      {/* Ears */}
      <ellipse cx="68" cy="93" rx="4" ry="7" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
      <ellipse cx="132" cy="93" rx="4" ry="7" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
    </svg>
  );
}

// ── Whale / J.P. Morgan: 大鼻子、八字鬍、威嚴、高帽紳士 ──────────
export function WhaleAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="whale-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="whale-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-light)" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.35"/>
        </linearGradient>
        <linearGradient id="whale-hat" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.4"/>
        </linearGradient>
        <filter id="whale-shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal)" floodOpacity="0.2"/></filter>
      </defs>

      <circle cx="100" cy="100" r="96" fill="url(#whale-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>

      {/* Shoulders — formal suit, wide */}
      <path d="M38 180 Q50 152 72 143 L100 136 L128 143 Q150 152 162 180" fill="var(--signal)" fillOpacity="0.35"/>
      <path d="M38 180 Q50 152 72 143 L100 136 L128 143 Q150 152 162 180" fill="none" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.25"/>
      {/* Suit lapels */}
      <path d="M88 142 L93 165" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.3"/>
      <path d="M112 142 L107 165" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.3"/>
      {/* Tie */}
      <path d="M96 140 L100 145 L104 140 L102 166 L100 168 L98 166 Z" fill="var(--signal)" fillOpacity="0.5"/>

      {/* Neck — thick, powerful */}
      <rect x="90" y="124" width="20" height="16" rx="4" fill="url(#whale-face)"/>

      {/* Head — broad, imposing */}
      <ellipse cx="100" cy="92" rx="34" ry="38" fill="url(#whale-face)" filter="url(#whale-shadow)"/>

      {/* Top hat */}
      <rect x="78" y="28" width="44" height="35" rx="4" fill="url(#whale-hat)"/>
      <rect x="78" y="28" width="44" height="35" rx="4" fill="none" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.3"/>
      {/* Hat brim */}
      <ellipse cx="100" cy="63" rx="38" ry="6" fill="url(#whale-hat)"/>
      <ellipse cx="100" cy="63" rx="38" ry="6" fill="none" stroke="var(--signal-light)" strokeWidth="0.75" strokeOpacity="0.25"/>
      {/* Hat band */}
      <rect x="80" y="55" width="40" height="4" fill="var(--signal-amber)" fillOpacity="0.3"/>

      {/* Eyes — piercing, commanding */}
      <ellipse cx="86" cy="90" rx="5" ry="3" fill="var(--signal)" fillOpacity="0.65"/>
      <ellipse cx="114" cy="90" rx="5" ry="3" fill="var(--signal)" fillOpacity="0.65"/>
      <circle cx="87" cy="89.5" r="1.5" fill="var(--signal-light)" fillOpacity="0.85"/>
      <circle cx="115" cy="89.5" r="1.5" fill="var(--signal-light)" fillOpacity="0.85"/>

      {/* Eyebrows — heavy, authoritative */}
      <path d="M78 83 Q86 78 95 82" stroke="var(--signal)" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>
      <path d="M105 82 Q114 78 122 83" stroke="var(--signal)" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>

      {/* Nose — large, prominent (Morgan's famous nose) */}
      <path d="M100 93 Q97 100 95 108 Q98 112 100 113 Q102 112 105 108 Q103 100 100 93" fill="var(--signal)" fillOpacity="0.15" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.3"/>

      {/* Handlebar mustache — Morgan's signature */}
      <path d="M85 115 Q90 112 100 113 Q110 112 115 115" stroke="var(--signal)" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>
      <path d="M85 115 Q80 118 76 116" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>
      <path d="M115 115 Q120 118 124 116" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>

      {/* Mouth under mustache */}
      <path d="M92 120 Q100 123 108 120" stroke="var(--signal)" strokeWidth="0.75" strokeLinecap="round" fill="none" strokeOpacity="0.2"/>

      {/* Jowls — heavy face */}
      <path d="M70 100 Q68 115 75 125" stroke="var(--signal)" strokeWidth="0.5" strokeOpacity="0.12" fill="none"/>
      <path d="M130 100 Q132 115 125 125" stroke="var(--signal)" strokeWidth="0.5" strokeOpacity="0.12" fill="none"/>

      {/* Ears */}
      <ellipse cx="65" cy="92" rx="5" ry="9" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
      <ellipse cx="135" cy="92" rx="5" ry="9" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
    </svg>
  );
}

// ── Ninja / Jim Simons: 光頭/禿頂、鬍子、數學家氣質、神秘微笑 ──────
export function NinjaAvatar({ size = 200, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ninja-bg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--signal-amber)" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02"/>
        </radialGradient>
        <linearGradient id="ninja-face" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--signal-amber-light)" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="var(--signal-amber)" stopOpacity="0.3"/>
        </linearGradient>
        <filter id="ninja-shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--signal)" floodOpacity="0.15"/></filter>
      </defs>

      <circle cx="100" cy="100" r="96" fill="url(#ninja-bg)" stroke="var(--signal)" strokeWidth="0.75" strokeOpacity="0.2"/>

      {/* Background — subtle math/algorithm pattern */}
      <text x="30" y="40" fontSize="8" fill="var(--signal)" fillOpacity="0.06" fontFamily="monospace">∑∫∂π</text>
      <text x="145" y="170" fontSize="8" fill="var(--signal)" fillOpacity="0.06" fontFamily="monospace">αβγδ</text>
      <text x="25" y="165" fontSize="7" fill="var(--signal)" fillOpacity="0.04" fontFamily="monospace">f(x)=</text>
      <text x="150" y="42" fontSize="7" fill="var(--signal)" fillOpacity="0.04" fontFamily="monospace">∇²ψ</text>

      {/* Shoulders — casual blazer */}
      <path d="M46 178 Q56 152 76 143 L100 137 L124 143 Q144 152 154 178" fill="var(--signal-amber)" fillOpacity="0.2"/>
      <path d="M46 178 Q56 152 76 143 L100 137 L124 143 Q144 152 154 178" fill="none" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2"/>
      {/* Open collar shirt */}
      <path d="M90 140 Q100 148 110 140" stroke="var(--signal-amber)" strokeWidth="1" strokeOpacity="0.3" fill="none"/>

      {/* Neck */}
      <rect x="92" y="126" width="16" height="14" rx="3" fill="url(#ninja-face)"/>

      {/* Head */}
      <ellipse cx="100" cy="90" rx="33" ry="38" fill="url(#ninja-face)" filter="url(#ninja-shadow)"/>

      {/* Bald/very thin hair top */}
      <path d="M67 85 Q67 55 82 48 Q92 44 100 43 Q108 44 118 48 Q133 55 133 85" fill="none" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.12"/>

      {/* Eyes — intelligent, observing */}
      <ellipse cx="86" cy="88" rx="5" ry="3" fill="var(--signal-amber)" fillOpacity="0.6"/>
      <ellipse cx="114" cy="88" rx="5" ry="3" fill="var(--signal-amber)" fillOpacity="0.6"/>
      <circle cx="87" cy="87.5" r="1.5" fill="var(--signal-amber-light)" fillOpacity="0.85"/>
      <circle cx="115" cy="87.5" r="1.5" fill="var(--signal-amber-light)" fillOpacity="0.85"/>

      {/* Eyebrows — relaxed, thoughtful */}
      <path d="M78 82 Q86 79 95 81" stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>
      <path d="M105 81 Q114 79 122 82" stroke="var(--signal-amber)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>

      {/* Nose */}
      <path d="M100 92 L98 104 Q100 107 102 104 L100 92" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.25" fill="none"/>

      {/* Full beard — Simons' signature */}
      <path d="M72 102 Q72 108 74 115 Q78 126 90 130 Q100 133 110 130 Q122 126 126 115 Q128 108 128 102" fill="var(--signal-amber)" fillOpacity="0.2" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.25"/>
      {/* Beard texture lines */}
      <path d="M80 110 Q82 118 88 125" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.15" fill="none"/>
      <path d="M90 108 Q92 118 96 126" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.12" fill="none"/>
      <path d="M100 107 Q100 118 100 128" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.15" fill="none"/>
      <path d="M110 108 Q108 118 104 126" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.12" fill="none"/>
      <path d="M120 110 Q118 118 112 125" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.15" fill="none"/>

      {/* Mouth — mysterious smile, visible through beard */}
      <path d="M90 112 Q100 117 110 112" stroke="var(--signal-amber)" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.3"/>

      {/* Forehead wrinkles — wisdom */}
      <path d="M82 72 Q100 69 118 72" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.1" fill="none"/>
      <path d="M84 76 Q100 73 116 76" stroke="var(--signal-amber)" strokeWidth="0.5" strokeOpacity="0.08" fill="none"/>

      {/* Ears */}
      <ellipse cx="66" cy="90" rx="4" ry="8" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
      <ellipse cx="134" cy="90" rx="4" ry="8" stroke="var(--signal-amber)" strokeWidth="0.75" strokeOpacity="0.2" fill="none"/>
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

export const AVATAR_META: Record<string, { label: string; color: string; desc: string; figure: string; figureDesc: string }> = {
  surfer: { label: "趨勢衝浪者", color: "var(--signal-light)", desc: "追逐趨勢，乘浪而行", figure: "Jesse Livermore", figureDesc: "華爾街投機之王" },
  sniper: { label: "精準狙擊手", color: "var(--signal-amber)", desc: "精準進出，一擊致勝", figure: "George Soros", figureDesc: "精準狙擊英鎊的金融巨匠" },
  turtle: { label: "穩健套利者", color: "var(--signal)", desc: "穩健低風險，細水長流", figure: "Benjamin Graham", figureDesc: "價值投資之父" },
  rocket: { label: "火箭追擊手", color: "var(--signal-amber-light)", desc: "高風險高回報，全力爆發", figure: "Michael Burry", figureDesc: "做空次貸的孤注一擲者" },
  whale: { label: "市場鯨魚", color: "var(--text-secondary)", desc: "大資金玩家，掌控市場", figure: "J.P. Morgan", figureDesc: "金融巨鱷，掌控華爾街" },
  ninja: { label: "閃電忍者", color: "var(--text-primary)", desc: "快進快出，神出鬼沒", figure: "Jim Simons", figureDesc: "量化交易之王" },
};
