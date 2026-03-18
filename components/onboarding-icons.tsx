import React from "react";
// Brand VI onboarding step icons

const iconProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const;

// Step 1: Invite Code - Key
export function IconKey() {
  return (
    <svg {...iconProps}>
      <circle cx="8" cy="10" r="5" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <circle cx="8" cy="10" r="2" fill="var(--accent)" />
      <line x1="13" y1="10" x2="21" y2="10" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="10" x2="18" y2="14" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="10" x2="21" y2="14" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Step 2: Trade Style - Crosshair/target
export function IconTradeStyle() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8" stroke="var(--signal)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="4" stroke="var(--signal)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="1.5" fill="var(--accent)" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="2" y1="12" x2="6" y2="12" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="18" y1="12" x2="22" y2="12" stroke="var(--signal)" strokeWidth="1.2" />
    </svg>
  );
}

// Step 3: Risk & Time - Balance scale
export function IconRiskTime() {
  return (
    <svg {...iconProps}>
      <line x1="12" y1="3" x2="12" y2="19" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="4" y1="8" x2="20" y2="8" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 8l2 6h-4l2-6z" stroke="var(--accent)" strokeWidth="1.2" fill="none" />
      <path d="M20 8l2 6h-4l2-6z" stroke="var(--accent)" strokeWidth="1.2" fill="none" />
      <line x1="8" y1="19" x2="16" y2="19" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Step 4: Telegram - Paper plane
export function IconTelegram() {
  return (
    <svg {...iconProps}>
      <path d="M3 11l18-7-7 18-3-8-8-3z" stroke="var(--signal)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <line x1="11" y1="14" x2="21" y2="4" stroke="var(--accent)" strokeWidth="1.2" />
    </svg>
  );
}
