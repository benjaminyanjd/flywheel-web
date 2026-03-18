export function deriveFocus(profitSource: string[]): string {
  // All new trading methods map to crypto focus
  const cryptoMethods = ["contract", "spot", "onchain", "meme", "arbitrage", "airdrop", "alpha"];
  // Legacy values
  const legacyCrypto = ["crypto_trading"];
  const legacyAI = ["ai_content", "saas_tech"];
  const legacyBroad = ["info_arbitrage", "early_investment"];

  const parts = new Set<string>();
  if (profitSource.some(v => cryptoMethods.includes(v) || legacyCrypto.includes(v))) parts.add("crypto");
  if (profitSource.some(v => legacyAI.includes(v))) parts.add("ai");
  if (profitSource.some(v => legacyBroad.includes(v))) {
    parts.add("crypto"); parts.add("ai"); parts.add("saas"); parts.add("overseas");
  }
  return parts.size > 0 ? Array.from(parts).join(",") : "all";
}

export const TRADE_METHOD_VALUES = [
  "contract", "spot", "onchain", "meme", "arbitrage", "airdrop", "alpha",
] as const;

// Legacy - kept for backward compat
export const PROFIT_SOURCE_VALUES = [
  "crypto_trading", "ai_content", "info_arbitrage", "saas_tech", "early_investment",
] as const;

export const CORE_SKILL_VALUES = [
  "trading", "content_ops", "coding", "sales_biz",
] as const;

export const OPP_HORIZON_VALUES = [
  "short_term", "mid_term", "long_term",
] as const;

export const RISK_LEVEL_VALUES = [
  "conservative", "balanced", "aggressive",
] as const;

export const TIME_BUDGET_VALUES = [
  "under_1h", "1_3h", "unlimited",
] as const;

// Translation key mappings for each preference group
export const PROFIT_SOURCE_KEYS = PROFIT_SOURCE_VALUES.map(v => ({
  value: v,
  tKey: `profit_${v}` as const,
}));

export const CORE_SKILL_KEYS = CORE_SKILL_VALUES.map(v => ({
  value: v,
  tKey: `skill_${v}` as const,
}));

export const OPP_HORIZON_KEYS = OPP_HORIZON_VALUES.map(v => ({
  value: v,
  tKey: `horizon_${v}` as const,
}));

export const RISK_LEVEL_KEYS = RISK_LEVEL_VALUES.map(v => ({
  value: v,
  tKey: `risk_${v}` as const,
}));

export const TIME_BUDGET_KEYS = TIME_BUDGET_VALUES.map(v => ({
  value: v,
  tKey: `time_${v}` as const,
}));
