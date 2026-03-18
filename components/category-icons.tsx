import React from "react";
// Brand VI category icons for 12 signal categories
// Colors: --signal (#3CB371) main, --accent (#FF6B35) highlight

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const iconProps = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const);

// 資金費率 — Trend line + percentage
export function IconFundingRate({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <polyline points="3,17 8,12 13,14 21,6" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17,6 21,6 21,10" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <text x="12" y="22" textAnchor="middle" fontSize="7" fontWeight="bold" fill="var(--accent)" fontFamily="monospace">%</text>
    </svg>
  );
}

// 爆倉清算 — Lightning bolt
export function IconLiquidation({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="6" y1="4" x2="4" y2="2" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="18" y1="20" x2="20" y2="22" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// 鯨魚動向 — Whale silhouette
export function IconWhaleMove({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <path d="M2 14c1-4 4-7 9-7 4 0 7 2 9 5 1 1.5 0 3-1 4-2 2-5 2-8 1-2-0.5-4-1-6 0-1.5 0.5-2.5 0-3-1.5z" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="7" cy="12" r="1" fill="var(--signal)" />
      <path d="M20 10c1-2 2-3 3-3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// KOL 喊單 — Megaphone
export function IconKolCall({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <path d="M18 8c2 1 3 3 3 5s-1 4-3 5" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M3 10v4a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 0z" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M15 9c1 0.5 1.5 1.5 1.5 3s-0.5 2.5-1.5 3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 鏈上資金 — Chain + arrow
export function IconOnchainFlow({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <path d="M10 13l-1.5 1.5a3 3 0 01-4.2-4.2L6.5 8" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M14 11l1.5-1.5a3 3 0 014.2 4.2L17.5 16" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <line x1="9" y1="15" x2="15" y2="9" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="12,9 15,9 15,12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// 新幣發射 — Rocket
export function IconTokenLaunch({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <path d="M12 2c-2 3-3 6-3 10h6c0-4-1-7-3-10z" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 12l-2 3h10l-2-3" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="15" x2="12" y2="19" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="10" y1="18" x2="10" y2="21" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="14" y1="18" x2="14" y2="21" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 空投機會 — Parachute
export function IconAirdropOpp({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <line x1="6" y1="10" x2="12" y2="18" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="18" y1="10" x2="12" y2="18" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="12" y1="4" x2="12" y2="18" stroke="var(--accent)" strokeWidth="1.2" />
      <rect x="9.5" y="18" width="5" height="4" rx="1" stroke="var(--accent)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// 上幣公告 — Clipboard/list
export function IconListing({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <path d="M9 1v4M15 1v4" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="10" x2="15" y2="10" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="14" x2="13" y2="14" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <line x1="9" y1="17" x2="14" y2="17" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// 套利價差 — Bi-directional arrows
export function IconSpread({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <path d="M4 8h12l-3-3" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 16H8l3 3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="2" fill="var(--signal)" opacity="0.3" />
    </svg>
  );
}

// 安全預警 — Shield
export function IconSecurity({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 12l2 2 4-4" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 宏觀政策 — Globe
export function IconMacro({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <circle cx="12" cy="12" r="9" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <path d="M12 3a14.5 14.5 0 010 18" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M12 3a14.5 14.5 0 000 18" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 8h17M3.5 16h17" stroke="var(--signal)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// DeFi 收益 — Vault/safe
export function IconDefiYield({ size = 16, className = "", style }: IconProps) {
  return (
    <svg {...iconProps(size)} className={className} style={style}>
      <rect x="3" y="6" width="18" height="14" rx="2" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="var(--signal)" strokeWidth="1.2" />
      <circle cx="12" cy="16" r="2.5" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="16" r="0.8" fill="var(--accent)" />
      <rect x="8" y="3" width="8" height="3" rx="1" stroke="var(--signal)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// Map category key → icon component
export const CATEGORY_ICONS: Record<string, React.FC<IconProps>> = {
  funding_rate: IconFundingRate,
  liquidation: IconLiquidation,
  whale_move: IconWhaleMove,
  kol_call: IconKolCall,
  onchain_flow: IconOnchainFlow,
  token_launch: IconTokenLaunch,
  airdrop_opp: IconAirdropOpp,
  listing: IconListing,
  spread: IconSpread,
  security: IconSecurity,
  macro: IconMacro,
  defi_yield: IconDefiYield,
};

// Category groups for UI organization
export const CATEGORY_GROUPS = [
  {
    key: "trading_signals",
    zh: "交易信號",
    en: "Trading Signals",
    categories: ["funding_rate", "liquidation", "whale_move", "spread"],
  },
  {
    key: "market_dynamics",
    zh: "市場動態",
    en: "Market Dynamics",
    categories: ["kol_call", "onchain_flow", "token_launch", "listing", "macro"],
  },
  {
    key: "opportunities",
    zh: "機會發現",
    en: "Opportunities",
    categories: ["airdrop_opp", "defi_yield", "security"],
  },
] as const;

// Category → group color mapping for badges
export function getCategoryBadgeColor(category: string): { bg: string; text: string; border: string } {
  const tradingCats = new Set(["funding_rate", "liquidation", "whale_move", "spread"]);
  const marketCats = new Set(["kol_call", "onchain_flow", "token_launch", "listing", "macro"]);
  const oppCats = new Set(["airdrop_opp", "defi_yield", "security"]);

  if (tradingCats.has(category)) {
    return { bg: "rgba(249, 115, 22, 0.1)", text: "rgb(249, 115, 22)", border: "rgba(249, 115, 22, 0.3)" };
  }
  if (marketCats.has(category)) {
    return { bg: "rgba(34, 197, 94, 0.1)", text: "rgb(34, 197, 94)", border: "rgba(34, 197, 94, 0.3)" };
  }
  if (oppCats.has(category)) {
    return { bg: "rgba(59, 130, 246, 0.1)", text: "rgb(59, 130, 246)", border: "rgba(59, 130, 246, 0.3)" };
  }
  // fallback
  return { bg: "var(--bg-panel)", text: "var(--text-muted)", border: "var(--border)" };
}

// All 12 category values
export const ALL_CATEGORY_VALUES = [
  "funding_rate", "liquidation", "whale_move", "spread",
  "kol_call", "onchain_flow", "token_launch", "listing", "macro",
  "airdrop_opp", "defi_yield", "security",
] as const;

// Map old category values to new ones
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  ai_tech: "macro",
  crypto_news: "listing",
  onchain: "onchain_flow",
  community: "security",
  kol: "kol_call",
  alpha: "spread",
};
