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
  "name": "Flywheel",
  "url": "https://flywheelsea.club",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "每天早上 8 點，把全球信號提煉成你今天可以行動的 3–5 件事，直達 Telegram。自動掃描 Reddit、Hacker News、GitHub 等平台信號，AI 生成落地行動計劃。",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "免費試用"
  },
  "inLanguage": "zh-TW",
  "author": {
    "@type": "Organization",
    "name": "Flywheel"
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
