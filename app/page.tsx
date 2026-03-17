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

export default function LandingPage() {
  const { userCount, waitlistCount } = getCounts()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LandingContent userCount={userCount} waitlistCount={waitlistCount} quotaTotal={QUOTA_TOTAL} />
    </>
  )
}
