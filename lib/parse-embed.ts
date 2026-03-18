export interface EmbedData {
  why_now: string;
  profit_logic: string;
  actions: string[];
  risks: string[];
  confidence: number;
  deadline?: string;
  estimated_time?: string;
  category?: string;
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
      deadline: typeof d.deadline === "string" ? d.deadline : undefined,
      estimated_time: typeof d.estimated_time === "string" ? d.estimated_time : undefined,
      category: typeof d.category === "string" ? d.category : undefined,
    };
  } catch {
    return null;
  }
}
