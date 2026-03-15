export function deriveFocus(profitSource: string[]): string {
  const parts = new Set<string>();
  if (profitSource.includes("crypto_trading")) parts.add("crypto");
  if (profitSource.includes("ai_content") || profitSource.includes("saas_tech")) parts.add("ai");
  if (profitSource.includes("info_arbitrage") || profitSource.includes("early_investment")) {
    parts.add("crypto"); parts.add("ai"); parts.add("saas"); parts.add("overseas");
  }
  return parts.size > 0 ? Array.from(parts).join(",") : "all";
}

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
