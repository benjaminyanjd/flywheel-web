import { getDb } from "@/lib/db"
import LandingContent from "@/components/landing-content"

const USER_COUNT_BASE = 45  // base offset for social proof
const QUOTA_TOTAL = 50      // total quota for this batch

function getCounts(): { userCount: number; waitlistCount: number } {
  try {
    const db = getDb()
    // Single query to get both counts at once
    const row = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM user_subscriptions) as subs,
        (SELECT COUNT(*) FROM waitlist) as wl
    `).get() as { subs: number; wl: number }
    return {
      userCount: USER_COUNT_BASE + row.subs + row.wl,
      waitlistCount: Math.min(row.wl + 36, QUOTA_TOTAL - 2),
    }
  } catch {
    return { userCount: USER_COUNT_BASE, waitlistCount: 36 }
  }
}

// JSON-LD structured data for rich search results
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "嗅鐘",
  "url": "https://sniffingclock.club",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "每天從 280+ 信號源掃描 500+ 條信號，AI 過濾匹配後，每日早 8 點推送 3-5 個定向可執行機會到你的 Telegram。",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "免費試用"
  },
  "inLanguage": "zh-TW",
  "author": {
    "@type": "Organization",
    "name": "嗅鐘 Sniffing Clock"
  }
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "嗅鐘和 newsletter 有什麼不同？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Newsletter 是編輯挑給所有人看的。嗅鐘根據你的角色和風險偏好個人化過濾，推的是「你現在能做的」——附帶置信度評分、時效窗口、具體行動步驟。"
      }
    },
    {
      "@type": "Question",
      "name": "邀請碼從哪裡獲取？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "填寫申請表單，我們會在 24 小時內通過 Telegram 聯繫你並發送邀請碼。"
      }
    },
    {
      "@type": "Question",
      "name": "必須有 Telegram 才能用嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Telegram 是主要推送渠道。網頁端 sniffingclock.club 也可以隨時查看全部機會和雷達。"
      }
    },
    {
      "@type": "Question",
      "name": "7 天試用結束後會自動扣費嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "不會。試用期結束後系統暫停，不會自動續費。你可以隨時選擇訂閱繼續使用。"
      }
    },
    {
      "@type": "Question",
      "name": "掃描哪些資訊源？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Reddit、Hacker News、KOL 推文、BlockBeats、GitHub Trending、全球 RSS 訂閱，每 15-30 分鐘掃描一次，每天超過 500 條信號。"
      }
    },
    {
      "@type": "Question",
      "name": "我的資料安全嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "我們只存儲你的 Telegram Chat ID 和偏好設置，不收集個人身份信息，不出售數據。"
      }
    }
  ]
};

export default function LandingPage() {
  const { userCount, waitlistCount } = getCounts()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <LandingContent userCount={userCount} waitlistCount={waitlistCount} quotaTotal={QUOTA_TOTAL} />
    </>
  )
}
