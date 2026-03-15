export interface EmbedData {
  why_now: string;
  profit_logic: string;
  actions: string[];
  risks: string[];
  confidence: number;
}

export function parseEmbed(raw: string): EmbedData | null {
  try {
    const d = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      why_now: d.why_now || "",
      profit_logic: d.profit_logic || "",
      actions: Array.isArray(d.actions) ? d.actions : [],
      risks: Array.isArray(d.risks) ? d.risks : [],
      confidence: typeof d.confidence === "number" ? d.confidence : 0,
    };
  } catch {
    return null;
  }
}
