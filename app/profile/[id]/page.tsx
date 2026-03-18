import { Metadata } from "next";
import { getDb } from "@/lib/db";
import { ProfileClient } from "./ProfileClient";

export const runtime = "nodejs";

interface Props {
  params: Promise<{ id: string }>;
}

const PROFILE_LABELS: Record<string, Record<string, string>> = {
  profit_source: {
    contract: "合約交易",
    spot: "現貨交易",
    onchain: "鏈上交易",
    meme: "Meme 幣",
    arbitrage: "套利",
    airdrop: "空投擼毛",
    alpha: "Alpha 打新",
  },
  capital_range: {
    tiny: "< $1K",
    small: "$1K – $10K",
    medium: "$10K – $100K",
    large: "$100K+",
  },
  trade_goal: {
    grow_fast: "快速增長",
    steady_income: "穩定收益",
    preserve_grow: "保值增值",
    learn_explore: "學習探索",
  },
  risk_level: {
    conservative: "保守型",
    balanced: "平衡型",
    aggressive: "激進型",
  },
};

function getLabel(settings: Record<string, string | null>): string {
  if (!settings.trade_goal) return "交易新手";
  if (settings.risk_level === "aggressive") return "高波動獵手";
  if (settings.risk_level === "conservative") return "穩健守護者";
  if (settings.trade_goal === "grow_fast") return "小資衝浪手";
  if (settings.trade_goal === "steady_income") return "收益農夫";
  if (settings.trade_goal === "learn_explore") return "探索先鋒";
  return "平衡行者";
}

function getRiskRules(settings: Record<string, string | null>): string[] {
  if (settings.risk_level === "conservative") return ["單筆倉位 ≤ 5%", "止損設定 -8%", "避開高波動 Meme 幣"];
  if (settings.risk_level === "aggressive") return ["單筆倉位 ≤ 15%", "止損設定 -15%", "追蹤止盈 +30%"];
  return ["單筆倉位 ≤ 10%", "止損設定 -10%", "分批建倉降低風險"];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sniffingclock.club";

  return {
    title: "交易畫像 | 嗅鐘 Sniffing Clock",
    description: "查看這位交易者的交易畫像，發現你的交易風格",
    openGraph: {
      title: "交易畫像 | 嗅鐘",
      description: "查看這位交易者的交易畫像，發現你的交易風格",
      images: [`${baseUrl}/api/profile-card?userId=${id}`],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: "交易畫像 | 嗅鐘",
      description: "查看這位交易者的交易畫像",
      images: [`${baseUrl}/api/profile-card?userId=${id}`],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;

  let settings: Record<string, string | null> | null = null;
  try {
    const db = getDb();
    settings = db.prepare(
      "SELECT profit_source, capital_range, trade_goal, risk_level, time_budget FROM user_settings WHERE user_id = ?"
    ).get(id) as Record<string, string | null> | null;
  } catch {
    // DB error
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0E08" }}>
        <div className="text-center space-y-4">
          <p style={{ color: "rgba(250,250,247,0.5)" }}>找不到此用戶的交易畫像</p>
          <a href="/" className="inline-block px-6 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#3CB371", color: "#0A0E08" }}>
            回到首頁
          </a>
        </div>
      </div>
    );
  }

  const label = getLabel(settings);
  const labelFirstChar = label[0];
  const tradeMethods = (settings.profit_source || "")
    .split(",")
    .filter(Boolean)
    .map(v => PROFILE_LABELS.profit_source[v] || v);
  const capitalLabel = PROFILE_LABELS.capital_range[settings.capital_range || ""] || "未設定";
  const goalLabel = PROFILE_LABELS.trade_goal[settings.trade_goal || ""] || "未設定";
  const riskLabel = PROFILE_LABELS.risk_level[settings.risk_level || ""] || "未設定";
  const riskRules = getRiskRules(settings);

  return (
    <ProfileClient
      label={label}
      labelFirstChar={labelFirstChar}
      tradeMethods={tradeMethods}
      capitalLabel={capitalLabel}
      goalLabel={goalLabel}
      riskLabel={riskLabel}
      riskRules={riskRules}
    />
  );
}
