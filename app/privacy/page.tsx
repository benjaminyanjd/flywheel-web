import Link from "next/link";
import { FlywheelLogo } from "@/components/flywheel-logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私政策 | Flywheel",
  description: "Flywheel 隱私政策 — 我們如何收集、使用和保護您的資料",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <FlywheelLogo size={20} className="text-amber-400" />
            <span className="font-bold text-slate-100">Flywheel</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">隱私政策</h1>
        <p className="text-slate-500 text-sm mb-10">最後更新：2026 年 3 月</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">1. 我們收集哪些資料</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>您的 Telegram Chat ID（用於推送每日摘要）</li>
              <li>您的電子郵件地址（用於帳號通知，可選填）</li>
              <li>您的偏好設定（訂閱類別、掃描頻率）</li>
              <li>帳號建立時間與試用狀態</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">2. 我們如何使用資料</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>向您的 Telegram 帳號推送每日市場情報摘要</li>
              <li>根據您的偏好設定過濾和排序信號</li>
              <li>改善服務品質和用戶體驗</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">3. 資料保護</h2>
            <p className="text-slate-400">
              所有資料儲存於安全伺服器。我們不出售、不分享您的個人資料給第三方。
              我們不收集個人身份信息（如真實姓名、地址、電話）。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">4. 第三方服務</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong>Clerk</strong> — 身份驗證（適用其隱私政策）</li>
              <li><strong>Telegram</strong> — 訊息推送（適用其隱私政策）</li>
              <li><strong>Anthropic</strong> — AI 分析（不傳遞用戶個人資料）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">5. 您的權利</h2>
            <p className="text-slate-400">
              您可以隨時要求刪除帳號及所有相關資料。請聯繫{" "}
              <a href="https://t.me/BJMYan" className="text-amber-400 hover:text-amber-300">
                @BJMYan
              </a>{" "}
              提出申請。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">6. 聯繫我們</h2>
            <p className="text-slate-400">
              如有隱私相關問題，請透過 Telegram 聯繫：{" "}
              <a href="https://t.me/BJMYan" className="text-amber-400 hover:text-amber-300">
                @BJMYan
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-8 text-center text-xs text-slate-700">
        <Link href="/" className="hover:text-slate-500 transition-colors">← 回首頁</Link>
      </footer>
    </div>
  );
}
