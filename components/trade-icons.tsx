import React from "react";
// Brand VI trade method icons
// Colors: --signal (#3CB371) main, --accent (#FF6B35) highlight

const iconProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const;

// 合約交易 - Candlestick chart
export function IconContract() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="8" width="3" height="10" rx="0.5" fill="var(--signal)" />
      <line x1="5.5" y1="5" x2="5.5" y2="8" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="5.5" y1="18" x2="5.5" y2="21" stroke="var(--signal)" strokeWidth="1.2" />
      <rect x="10.5" y="4" width="3" height="12" rx="0.5" fill="var(--accent)" />
      <line x1="12" y1="2" x2="12" y2="4" stroke="var(--accent)" strokeWidth="1.2" />
      <line x1="12" y1="16" x2="12" y2="19" stroke="var(--accent)" strokeWidth="1.2" />
      <rect x="17" y="6" width="3" height="8" rx="0.5" fill="var(--signal)" />
      <line x1="18.5" y1="3" x2="18.5" y2="6" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="18.5" y1="14" x2="18.5" y2="17" stroke="var(--signal)" strokeWidth="1.2" />
    </svg>
  );
}

// 現貨交易 - Coin with dollar sign
export function IconSpot() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <path d="M12 6v1.5M12 16.5V18" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 14c0 1.1.9 2 2.5 2s2.5-.9 2.5-2-1-1.5-2.5-2S9.5 11.1 9.5 10s.9-2 2.5-2 2.5.9 2.5 2" stroke="var(--signal)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 鏈上交易 - Chain links
export function IconOnchain() {
  return (
    <svg {...iconProps}>
      <path d="M10 13l-1.5 1.5a3 3 0 01-4.2-4.2L6.5 8" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M14 11l1.5-1.5a3 3 0 014.2 4.2L17.5 16" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <line x1="9" y1="15" x2="15" y2="9" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Meme 幣 - Doge-inspired face
export function IconMeme() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <circle cx="9" cy="10" r="1.2" fill="var(--signal)" />
      <circle cx="15" cy="10" r="1.2" fill="var(--signal)" />
      <path d="M8.5 14.5c1 1.5 5.5 1.5 7 0" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 套利 - Two-way arrows
export function IconArbitrage() {
  return (
    <svg {...iconProps}>
      <path d="M4 8h12l-3-3" stroke="var(--signal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 16H8l3 3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="2" fill="var(--signal)" opacity="0.3" />
    </svg>
  );
}

// 空投擼毛 - Parachute/gift
export function IconAirdrop() {
  return (
    <svg {...iconProps}>
      <path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--signal)" strokeWidth="1.8" fill="none" />
      <line x1="6" y1="10" x2="12" y2="18" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="18" y1="10" x2="12" y2="18" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="12" y1="4" x2="12" y2="18" stroke="var(--accent)" strokeWidth="1.2" />
      <rect x="9.5" y="18" width="5" height="4" rx="1" stroke="var(--accent)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

// Alpha 打新 - Rocket/target
export function IconAlpha() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" stroke="var(--signal)" strokeWidth="1.2" fill="none" opacity="0.3" />
      <circle cx="12" cy="12" r="5" stroke="var(--signal)" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="2" fill="var(--accent)" />
      <line x1="12" y1="2" x2="12" y2="5" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="var(--signal)" strokeWidth="1.2" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="var(--signal)" strokeWidth="1.2" />
    </svg>
  );
}

export const TRADE_ICONS: Record<string, () => React.JSX.Element> = {
  contract: IconContract,
  spot: IconSpot,
  onchain: IconOnchain,
  meme: IconMeme,
  arbitrage: IconArbitrage,
  airdrop: IconAirdrop,
  alpha: IconAlpha,
};
