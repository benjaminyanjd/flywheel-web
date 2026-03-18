import React from "react";
// Brand VI profile icons for capital range & trade goal
// Colors: --signal (#3CB371) main, --accent (#FF6B35) highlight

const iconProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const;

// === Capital Range Icons ===

// < $1K - Single coin
export function IconCapitalTiny() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="13" r="8" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <path d="M12 8v1.5M12 17v1.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 15c0 .8.9 1.5 2 1.5s2-.7 2-1.5-.9-1.2-2-1.5-2-.7-2-1.5.9-1.5 2-1.5 2 .7 2 1.5" stroke="var(--signal)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// $1K-$10K - Stacked coins
export function IconCapitalSmall() {
  return (
    <svg {...iconProps}>
      <ellipse cx="12" cy="16" rx="7" ry="3" stroke="var(--signal)" strokeWidth="1.5" fill="none" />
      <ellipse cx="12" cy="12" rx="7" ry="3" stroke="var(--signal)" strokeWidth="1.5" fill="none" />
      <ellipse cx="12" cy="8" rx="7" ry="3" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
      <line x1="5" y1="8" x2="5" y2="16" stroke="var(--signal)" strokeWidth="1.5" />
      <line x1="19" y1="8" x2="19" y2="16" stroke="var(--signal)" strokeWidth="1.5" />
    </svg>
  );
}

// $10K-$100K - Diamond / gem
export function IconCapitalMedium() {
  return (
    <svg {...iconProps}>
      <path d="M6 9h12l-6 12L6 9z" stroke="var(--signal)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <path d="M6 9l3-5h6l3 5" stroke="var(--accent)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <path d="M9 4l3 5 3-5" stroke="var(--signal)" strokeWidth="1.2" fill="none" />
      <line x1="12" y1="9" x2="12" y2="21" stroke="var(--signal)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// $100K+ - Vault / safe
export function IconCapitalLarge() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="3.5" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="1" fill="var(--accent)" />
      <line x1="15.5" y1="12" x2="18" y2="12" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5" y="19" width="3" height="2" rx="0.5" fill="var(--signal)" />
      <rect x="16" y="19" width="3" height="2" rx="0.5" fill="var(--signal)" />
    </svg>
  );
}

// === Trade Goal Icons ===

// Fast Growth - Rocket
export function IconGoalGrowFast() {
  return (
    <svg {...iconProps}>
      <path d="M12 3c0 0-6 4-6 12h4l2 6 2-6h4c0-8-6-12-6-12z" stroke="var(--accent)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2" fill="var(--signal)" />
      <path d="M7 18l-2 3M17 18l2 3" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Steady Income - Upward trend line
export function IconGoalSteadyIncome() {
  return (
    <svg {...iconProps}>
      <polyline points="3,17 8,14 12,15 16,10 21,7" stroke="var(--signal)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="7" r="2" fill="var(--accent)" />
      <line x1="3" y1="20" x2="21" y2="20" stroke="var(--signal)" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}

// Preserve & Grow - Shield with arrow up
export function IconGoalPreserveGrow() {
  return (
    <svg {...iconProps}>
      <path d="M12 3L4 7v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-4z" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <path d="M12 9v6M9.5 11.5L12 9l2.5 2.5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Learn & Explore - Book / compass
export function IconGoalLearnExplore() {
  return (
    <svg {...iconProps}>
      <path d="M4 4h6c1.1 0 2 .9 2 2v14c-1-1-2.5-1-4-1H4V4z" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <path d="M20 4h-6c-1.1 0-2 .9-2 2v14c1-1 2.5-1 4-1h4V4z" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="11" r="1.5" fill="var(--accent)" />
    </svg>
  );
}

export const CAPITAL_ICONS: Record<string, () => React.JSX.Element> = {
  tiny: IconCapitalTiny,
  small: IconCapitalSmall,
  medium: IconCapitalMedium,
  large: IconCapitalLarge,
};

export const GOAL_ICONS: Record<string, () => React.JSX.Element> = {
  grow_fast: IconGoalGrowFast,
  steady_income: IconGoalSteadyIncome,
  preserve_grow: IconGoalPreserveGrow,
  learn_explore: IconGoalLearnExplore,
};
