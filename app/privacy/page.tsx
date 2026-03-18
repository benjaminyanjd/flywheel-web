import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私政策 | 嗅鐘 Sniffing Clock",
  description: "嗅鐘 Sniffing Clock 隱私政策 — 我們如何收集、使用和保護您的資料",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}>
      <TopNav hideCta />

      <main className="max-w-2xl mx-auto px-6 py-16 flex-1">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>隱私政策</h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>最後更新：2026 年 3 月</p>

        <div className="space-y-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>1. 我們收集哪些資料</h2>
            <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-muted)" }}>
              <li>您的 Telegram Chat ID（用於推送每日摘要）</li>
              <li>您的電子郵件地址（用於帳號通知，可選填）</li>
              <li>您的偏好設定（訂閱類別、掃描頻率）</li>
              <li>帳號建立時間與試用狀態</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>2. 我們如何使用資料</h2>
            <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-muted)" }}>
              <li>向您的 Telegram 帳號推送每日市場情報摘要</li>
              <li>根據您的偏好設定過濾和排序信號</li>
              <li>改善服務品質和用戶體驗</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>3. 資料保護</h2>
            <p style={{ color: "var(--text-muted)" }}>
              所有資料儲存於安全伺服器。我們不出售、不分享您的個人資料給第三方。
              我們不收集個人身份信息（如真實姓名、地址、電話）。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>4. 第三方服務</h2>
            <ul className="list-disc list-inside space-y-2" style={{ color: "var(--text-muted)" }}>
              <li><strong>Clerk</strong> — 身份驗證（適用其隱私政策）</li>
              <li><strong>Telegram</strong> — 訊息推送（適用其隱私政策）</li>
              <li><strong>Anthropic</strong> — AI 分析（不傳遞用戶個人資料）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>5. 您的權利</h2>
            <p style={{ color: "var(--text-muted)" }}>
              您可以隨時要求刪除帳號及所有相關資料。請聯繫{" "}
              <a href="https://t.me/+YPHT-FqxidA5NmU1" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
                @BJMYan
              </a>{" "}
              提出申請。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>6. 聯繫我們</h2>
            <p style={{ color: "var(--text-muted)" }}>
              如有隱私相關問題，請透過 Telegram 聯繫：{" "}
              <a href="https://t.me/+YPHT-FqxidA5NmU1" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
                @BJMYan
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="py-8 text-center border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <Link href="/" className="text-sm transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>← 回首頁</Link>
      </footer>
    </div>
  );
}
