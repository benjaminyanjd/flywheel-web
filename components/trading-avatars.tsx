"use client";

import React from "react";

interface AvatarProps {
  size?: number;
  className?: string;
}

export function SurferAvatar({ size = 160, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Ocean wave background */}
      <circle cx="80" cy="80" r="76" fill="var(--bg-card)" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.4"/>

      {/* Wave layers */}
      <path d="M20 105 Q40 90 60 100 Q80 110 100 95 Q120 80 140 90 L140 130 Q120 120 100 130 Q80 140 60 125 Q40 110 20 120 Z"
        fill="var(--signal)" fillOpacity="0.15"/>
      <path d="M20 115 Q50 100 80 112 Q110 124 140 108 L140 135 Q110 150 80 138 Q50 126 20 140 Z"
        fill="var(--signal)" fillOpacity="0.25"/>

      {/* Surfboard */}
      <ellipse cx="80" cy="100" rx="38" ry="8" transform="rotate(-10 80 100)"
        fill="var(--signal-amber)" fillOpacity="0.9"/>
      <ellipse cx="80" cy="100" rx="34" ry="5" transform="rotate(-10 80 100)"
        fill="var(--signal-amber-light)" fillOpacity="0.3"/>

      {/* Surfer body */}
      {/* Head */}
      <circle cx="80" cy="56" r="11" fill="var(--text-secondary)" fillOpacity="0.9"/>
      {/* Body */}
      <path d="M74 67 L68 88 L72 90 L78 76 L82 76 L88 90 L92 88 L86 67 Z"
        fill="var(--signal)" fillOpacity="0.8"/>
      {/* Arms outstretched for balance */}
      <path d="M74 72 L50 68" stroke="var(--text-secondary)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.8"/>
      <path d="M86 72 L110 65" stroke="var(--text-secondary)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.8"/>
      {/* Legs bent on board */}
      <path d="M72 90 L66 100 L70 100" stroke="var(--text-secondary)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.8"/>
      <path d="M88 90 L94 100 L90 102" stroke="var(--text-secondary)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.8"/>

      {/* Surf spray */}
      <circle cx="55" cy="92" r="2" fill="var(--signal-light)" fillOpacity="0.6"/>
      <circle cx="50" cy="88" r="1.5" fill="var(--signal-light)" fillOpacity="0.4"/>
      <circle cx="108" cy="90" r="1.5" fill="var(--signal-light)" fillOpacity="0.5"/>

      {/* Trend arrow */}
      <path d="M28 75 L45 60 L55 68 L75 45" stroke="var(--signal-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="3 2" strokeOpacity="0.7"/>
      <polygon points="75,40 80,52 70,50" fill="var(--signal-light)" fillOpacity="0.7"/>
    </svg>
  );
}

export function SniperAvatar({ size = 160, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="76" fill="var(--bg-card)" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.4"/>

      {/* Crosshair outer ring */}
      <circle cx="80" cy="80" r="45" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 3"/>
      {/* Crosshair inner ring */}
      <circle cx="80" cy="80" r="28" stroke="var(--signal)" strokeWidth="2" strokeOpacity="0.8"/>
      {/* Crosshair innermost */}
      <circle cx="80" cy="80" r="8" stroke="var(--signal-amber)" strokeWidth="2.5"/>
      {/* Center dot */}
      <circle cx="80" cy="80" r="3" fill="var(--signal-amber)"/>

      {/* Crosshair lines */}
      <line x1="80" y1="28" x2="80" y2="52" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="80" y1="108" x2="80" y2="132" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="80" x2="52" y2="80" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="108" y1="80" x2="132" y2="80" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round"/>

      {/* Sniper silhouette - upper right corner looking in */}
      {/* Head */}
      <circle cx="125" cy="38" r="8" fill="var(--text-secondary)" fillOpacity="0.7"/>
      {/* Body */}
      <path d="M118 46 L112 62" stroke="var(--text-secondary)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.7"/>
      {/* Rifle */}
      <path d="M105 52 L68 62" stroke="var(--text-muted)" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.8"/>
      <rect x="60" y="59" width="12" height="4" rx="1" fill="var(--text-muted)" fillOpacity="0.6"/>
      {/* Scope */}
      <circle cx="88" cy="57" r="4" stroke="var(--signal)" strokeWidth="1.5" fill="none" strokeOpacity="0.9"/>

      {/* Target brackets at crosshair intersection */}
      <path d="M62 62 L62 68 L68 68" stroke="var(--signal-amber)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M98 62 L98 68 L92 68" stroke="var(--signal-amber)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M62 98 L62 92 L68 92" stroke="var(--signal-amber)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M98 98 L98 92 L92 92" stroke="var(--signal-amber)" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Trajectory dotted line from rifle to center */}
      <line x1="72" y1="62" x2="80" y2="78" stroke="var(--signal-amber)" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.6"/>
    </svg>
  );
}

export function TurtleAvatar({ size = 160, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="76" fill="var(--bg-card)" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.4"/>

      {/* Turtle shell */}
      <ellipse cx="80" cy="82" rx="38" ry="32" fill="var(--signal)" fillOpacity="0.25"/>
      <ellipse cx="80" cy="80" rx="36" ry="30" fill="var(--signal)" fillOpacity="0.15"/>

      {/* Shell pattern - hexagons */}
      <polygon points="80,58 90,63 90,73 80,78 70,73 70,63" stroke="var(--signal)" strokeWidth="1.5" fill="var(--signal)" fillOpacity="0.2" strokeOpacity="0.6"/>
      <polygon points="94,70 100,74 100,82 94,86 88,82 88,74" stroke="var(--signal)" strokeWidth="1.5" fill="var(--signal)" fillOpacity="0.15" strokeOpacity="0.5"/>
      <polygon points="66,70 72,74 72,82 66,86 60,82 60,74" stroke="var(--signal)" strokeWidth="1.5" fill="var(--signal)" fillOpacity="0.15" strokeOpacity="0.5"/>
      <polygon points="80,82 90,86 90,96 80,100 70,96 70,86" stroke="var(--signal)" strokeWidth="1.5" fill="var(--signal)" fillOpacity="0.15" strokeOpacity="0.5"/>

      {/* Shield rim */}
      <ellipse cx="80" cy="80" rx="36" ry="30" stroke="var(--signal)" strokeWidth="2.5" fill="none" strokeOpacity="0.7"/>

      {/* Head */}
      <ellipse cx="80" cy="50" rx="10" ry="9" fill="var(--text-secondary)" fillOpacity="0.85"/>
      {/* Eyes */}
      <circle cx="76" cy="48" r="2" fill="var(--signal-light)"/>
      <circle cx="84" cy="48" r="2" fill="var(--signal-light)"/>
      <circle cx="76.5" cy="47.5" r="0.8" fill="var(--bg)"/>
      <circle cx="84.5" cy="47.5" r="0.8" fill="var(--bg)"/>
      {/* Neck */}
      <path d="M74 56 Q80 60 86 56" stroke="var(--text-secondary)" strokeWidth="6" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>

      {/* Legs - four flippers */}
      <ellipse cx="48" cy="68" rx="10" ry="5" transform="rotate(-20 48 68)" fill="var(--text-secondary)" fillOpacity="0.7"/>
      <ellipse cx="112" cy="68" rx="10" ry="5" transform="rotate(20 112 68)" fill="var(--text-secondary)" fillOpacity="0.7"/>
      <ellipse cx="48" cy="95" rx="10" ry="5" transform="rotate(20 48 95)" fill="var(--text-secondary)" fillOpacity="0.7"/>
      <ellipse cx="112" cy="95" rx="10" ry="5" transform="rotate(-20 112 95)" fill="var(--text-secondary)" fillOpacity="0.7"/>

      {/* Tail */}
      <path d="M80 110 Q82 118 80 122 Q78 118 80 110" fill="var(--text-secondary)" fillOpacity="0.6"/>

      {/* Shield/protection icon */}
      <path d="M80 64 L86 67 L86 74 Q86 78 80 80 Q74 78 74 74 L74 67 Z" fill="var(--signal-amber)" fillOpacity="0.5" stroke="var(--signal-amber)" strokeWidth="1" strokeOpacity="0.7"/>
    </svg>
  );
}

export function RocketAvatar({ size = 160, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="76" fill="var(--bg-card)" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.4"/>

      {/* Rocket exhaust/flame */}
      <path d="M68 112 Q72 128 70 138 Q76 126 80 130 Q84 126 90 138 Q88 128 92 112 Z"
        fill="var(--signal-amber)" fillOpacity="0.7"/>
      <path d="M72 112 Q75 122 73 130 Q78 122 80 126 Q82 122 87 130 Q85 122 88 112 Z"
        fill="var(--signal-amber-light)" fillOpacity="0.8"/>
      <path d="M75 112 Q77 118 80 122 Q83 118 85 112 Z"
        fill="white" fillOpacity="0.6"/>

      {/* Rocket body */}
      <path d="M80 20 L96 70 L96 108 L64 108 L64 70 Z" fill="var(--text-secondary)" fillOpacity="0.8"/>
      {/* Rocket nose cone */}
      <path d="M64 70 L80 20 L96 70 Z" fill="var(--signal)" fillOpacity="0.9"/>

      {/* Window */}
      <circle cx="80" cy="85" r="10" fill="var(--bg)" fillOpacity="0.3" stroke="var(--signal-light)" strokeWidth="2"/>
      <circle cx="80" cy="85" r="6" fill="var(--signal-light)" fillOpacity="0.25"/>
      <circle cx="78" cy="83" r="2" fill="white" fillOpacity="0.4"/>

      {/* Side fins */}
      <path d="M64 88 L46 108 L64 108 Z" fill="var(--signal-amber)" fillOpacity="0.8"/>
      <path d="M96 88 L114 108 L96 108 Z" fill="var(--signal-amber)" fillOpacity="0.8"/>

      {/* Stars */}
      <circle cx="32" cy="35" r="1.5" fill="var(--text-muted)" fillOpacity="0.8"/>
      <circle cx="42" cy="55" r="1" fill="var(--text-muted)" fillOpacity="0.6"/>
      <circle cx="120" cy="40" r="1.5" fill="var(--text-muted)" fillOpacity="0.8"/>
      <circle cx="130" cy="62" r="1" fill="var(--text-muted)" fillOpacity="0.6"/>
      <circle cx="25" cy="70" r="1" fill="var(--text-muted)" fillOpacity="0.5"/>
      <circle cx="135" cy="85" r="1.5" fill="var(--text-muted)" fillOpacity="0.5"/>

      {/* Speed lines */}
      <line x1="40" y1="75" x2="58" y2="78" stroke="var(--signal-light)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="36" y1="83" x2="56" y2="85" stroke="var(--signal-light)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4"/>
      <line x1="102" y1="78" x2="120" y2="75" stroke="var(--signal-light)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="104" y1="86" x2="124" y2="84" stroke="var(--signal-light)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4"/>

      {/* Chart line going up */}
      <path d="M34 120 L50 108 L62 115 L80 95 L95 100 L115 82 L126 88"
        stroke="var(--signal-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none" strokeOpacity="0.4" strokeDasharray="3 2"/>
    </svg>
  );
}

export function WhaleAvatar({ size = 160, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="76" fill="var(--bg-card)" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.4"/>

      {/* Ocean depth background */}
      <ellipse cx="80" cy="120" rx="65" ry="40" fill="var(--signal)" fillOpacity="0.08"/>

      {/* Whale body */}
      <path d="M28 82 Q38 60 70 58 Q90 56 108 65 Q128 74 132 86 Q136 98 120 104 Q105 110 90 108 Q70 112 55 108 Q35 102 28 82 Z"
        fill="var(--text-secondary)" fillOpacity="0.75"/>
      {/* Belly */}
      <path d="M55 90 Q70 96 90 95 Q108 94 120 88 Q115 104 95 108 Q70 112 55 108 Q42 104 42 96 Z"
        fill="var(--text-muted)" fillOpacity="0.5"/>

      {/* Tail fluke */}
      <path d="M28 82 L18 70 L30 72 L28 82 Z" fill="var(--text-secondary)" fillOpacity="0.7"/>
      <path d="M28 82 L15 90 L28 88 L28 82 Z" fill="var(--text-secondary)" fillOpacity="0.7"/>

      {/* Dorsal fin */}
      <path d="M85 58 L92 38 L98 58" fill="var(--text-secondary)" fillOpacity="0.7" stroke="var(--border)" strokeWidth="0.5"/>

      {/* Pectoral fins */}
      <path d="M60 80 L48 95 L65 92" fill="var(--text-muted)" fillOpacity="0.5"/>

      {/* Eye */}
      <circle cx="110" cy="75" r="5" fill="var(--bg)" fillOpacity="0.6"/>
      <circle cx="110" cy="75" r="3" fill="var(--signal)" fillOpacity="0.9"/>
      <circle cx="111" cy="74" r="1.2" fill="white" fillOpacity="0.8"/>

      {/* Blowhole water spout */}
      <path d="M95 58 Q90 45 88 36" stroke="var(--signal-light)" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
      <path d="M95 58 Q98 42 100 34" stroke="var(--signal-light)" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>
      <path d="M95 58 Q102 46 104 40" stroke="var(--signal-light)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>

      {/* Bubbles */}
      <circle cx="75" cy="110" r="3" stroke="var(--signal-light)" strokeWidth="1.5" fill="none" strokeOpacity="0.5"/>
      <circle cx="85" cy="118" r="2" stroke="var(--signal-light)" strokeWidth="1.5" fill="none" strokeOpacity="0.4"/>
      <circle cx="65" cy="116" r="2.5" stroke="var(--signal-light)" strokeWidth="1.5" fill="none" strokeOpacity="0.35"/>

      {/* Dollar signs floating around (representing large capital) */}
      <text x="30" y="48" fontSize="11" fill="var(--signal-amber)" fillOpacity="0.7" fontFamily="monospace" fontWeight="bold">$</text>
      <text x="130" y="55" fontSize="10" fill="var(--signal-amber)" fillOpacity="0.6" fontFamily="monospace" fontWeight="bold">$</text>
      <text x="125" y="112" fontSize="10" fill="var(--signal-amber)" fillOpacity="0.5" fontFamily="monospace" fontWeight="bold">$</text>

      {/* Market depth waves */}
      <path d="M20 130 Q40 124 60 128 Q80 132 100 126 Q120 120 140 124"
        stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.3"/>
      <path d="M20 138 Q45 133 70 137 Q95 141 120 134 Q132 131 140 133"
        stroke="var(--signal)" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.2"/>
    </svg>
  );
}

export function NinjaAvatar({ size = 160, className = "" }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="76" fill="var(--bg-card)" stroke="var(--signal)" strokeWidth="1.5" strokeOpacity="0.4"/>

      {/* Shadow/ground */}
      <ellipse cx="80" cy="130" rx="30" ry="6" fill="var(--bg)" fillOpacity="0.4"/>

      {/* Ninja body (mid-air leap) */}
      {/* Head with mask */}
      <circle cx="80" cy="48" r="13" fill="var(--bg)" fillOpacity="0.95" stroke="var(--border)" strokeWidth="0.5"/>
      {/* Mask covering lower face */}
      <path d="M67 50 Q80 58 93 50 L93 60 Q80 66 67 60 Z" fill="var(--text-muted)" fillOpacity="0.9"/>
      {/* Bandana/headband */}
      <path d="M67 46 Q80 42 93 46" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Eyes - narrow focused */}
      <path d="M71 47 Q75 45 79 47" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M81 47 Q85 45 89 47" stroke="var(--text-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Body - crouching leap */}
      <path d="M72 61 L68 95 L74 95 L80 78 L86 95 L92 95 L88 61 Z" fill="var(--text-muted)" fillOpacity="0.85"/>

      {/* Arms in action */}
      {/* Right arm throwing shuriken */}
      <path d="M88 68 L115 55" stroke="var(--text-muted)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.8"/>
      {/* Left arm in guard position */}
      <path d="M72 68 L50 72" stroke="var(--text-muted)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.8"/>

      {/* Legs in mid-air pose */}
      <path d="M74 95 L62 118 L68 122 L78 105" stroke="var(--text-muted)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.8"/>
      <path d="M86 95 L96 112 L102 108 L92 92" stroke="var(--text-muted)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.8"/>

      {/* Shuriken (flying) */}
      <g transform="translate(126, 44) rotate(45)">
        <path d="M0,-8 L3,-3 L8,0 L3,3 L0,8 L-3,3 L-8,0 L-3,-3 Z" fill="var(--signal)" fillOpacity="0.9"/>
        <circle cx="0" cy="0" r="2.5" fill="var(--bg)" fillOpacity="0.8"/>
      </g>

      {/* Second shuriken smaller */}
      <g transform="translate(108, 38) rotate(30)">
        <path d="M0,-5 L2,-2 L5,0 L2,2 L0,5 L-2,2 L-5,0 L-2,-2 Z" fill="var(--signal-amber)" fillOpacity="0.7"/>
        <circle cx="0" cy="0" r="1.5" fill="var(--bg)" fillOpacity="0.7"/>
      </g>

      {/* Motion blur trail */}
      <line x1="126" y1="44" x2="138" y2="40" stroke="var(--signal)" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4"/>

      {/* Speed lines */}
      <line x1="34" y1="75" x2="50" y2="72" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35"/>
      <line x1="32" y1="82" x2="48" y2="80" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.25"/>
      <line x1="35" y1="88" x2="50" y2="87" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.2"/>
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
