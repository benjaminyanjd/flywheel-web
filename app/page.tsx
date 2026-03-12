import Link from "next/link"
import WaitlistForm from "@/components/waitlist-form"
import { FlywheelLogo } from "@/components/flywheel-logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── Header ── */}
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlywheelLogo size={22} className="text-amber-400 animate-[spin_8s_linear_infinite]" />
            <span className="font-bold text-slate-100">Flywheel</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              登入
            </Link>
            <a href="https://t.me/BJMYan" target="_blank" rel="noopener noreferrer"
              className="text-sm bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 rounded-lg transition-colors font-medium">
              申請邀請碼
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero：痛點先行 ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8 text-center">
        {/* slot count badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-xs text-amber-400 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/>
          內測中 · 本期限額 50 個 · 已申請 38 人
        </div>

        {/* 痛點 */}
        <p className="text-slate-500 text-lg mb-3">每天刷完 Twitter、Reddit、TG 群……</p>

        {/* 核心承諾 */}
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 font-[family-name:var(--font-display)]">
          <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            還是不知道
          </span>
          <br/>
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            今天該做什麼？
          </span>
        </h1>

        <p className="text-xl text-slate-400 mb-3 max-w-2xl mx-auto leading-relaxed">
          Flywheel 每天早上 8 點，把全球信號提煉成<br/>
          <strong className="text-slate-200">你今天可以行動的 3–5 件事</strong>，直達 Telegram。
        </p>
        <p className="text-sm text-slate-600 mb-10">
          不是新聞摘要。是附帶「為什麼是現在」和「第一步怎麼做」的行動清單。
        </p>

        <WaitlistForm />
      </section>

      {/* 社会证明 */}
      <p className="text-center text-sm text-slate-500 pb-6">
        已有 47 位研究者和創業者在用 · 平均每天節省 2 小時信息篩選
      </p>

      {/* 三步流程 */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-10 text-slate-200">
          三步，從信息過載到精準行動
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "步驟 1",
              stepColor: "text-blue-400",
              borderColor: "border-l-blue-500",
              title: "信號採集",
              desc: "每 30 分鐘掃描 Reddit、HN、KOL 推文、GitHub、RSS 全球訂閱",
            },
            {
              step: "步驟 2",
              stepColor: "text-purple-400",
              borderColor: "border-l-purple-500",
              title: "AI 過濾評分",
              desc: "識別「為什麼是現在」，剔除噪音，只留下有時間窗口的機會",
            },
            {
              step: "步驟 3",
              stepColor: "text-amber-400",
              borderColor: "border-l-amber-500",
              title: "每天早 8 點",
              desc: "3–5 條行動清單推送到你的 Telegram，附帶第一步怎麼做",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`bg-slate-900/50 border border-slate-800 border-l-4 ${item.borderColor} rounded-2xl p-6 text-center`}
            >
              <p className={`text-xs font-mono uppercase tracking-wider mb-2 ${item.stepColor}`}>
                {item.step}
              </p>
              <p className="text-lg font-semibold text-slate-200 mb-2">{item.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 信號源標籤欄 ── */}
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-2">
        {[
          { label: "R Reddit", cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
          { label: "Y Hacker News", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
          { label: "✕ KOL 推文", cls: "bg-slate-400/10 text-slate-400 border-slate-500/20" },
          { label: "◉ RSS 全球訂閱", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
          { label: "⬡ GitHub Trending", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
        ].map(s => (
          <span key={s.label} className={`text-xs px-3 py-1 rounded-full border font-medium ${s.cls}`}>
            {s.label}
          </span>
        ))}
        <span className="text-xs text-slate-600 self-center ml-1">每 30 分鐘掃描</span>
      </div>

      {/* ── 產品預覽卡片 ── */}
      <section className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-xs text-slate-600 text-center mb-4 uppercase tracking-widest">今天早上你收到的</p>
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-slate-950/60">
          {/* Telegram 樣式頭部 */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-black">
              <FlywheelLogo size={16} className="text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Flywheel Daily</p>
              <p className="text-xs text-slate-500">今日 08:00</p>
            </div>
          </div>
          {/* 消息內容 */}
          <p className="text-xs text-slate-500 mb-3">📊 今日市場情報 · 3 條值得行動的機會</p>
          <div className="space-y-3">
            {[
              {
                badge: "🔥 高置信",
                badgeCls: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
                title: "Layer 2 Native Rollups 技術解讀 + 潛在項目埋伏",
                why: "以太坊研究人員剛演示了原型，處於早期驗證階段，引發新一輪 L2 敘事",
                action: "深入研究技術細節，篩選 3–5 個可能採用的早期項目"
              },
              {
                badge: "⚡ 中置信",
                badgeCls: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                title: "AI Agent 支付軌道：Stripe 新 API 的商業機會",
                why: "Stripe 剛開放 AI Agent 支付接口，開發者社區熱度激增",
                action: "評估是否搭建 Agent 支付中間層工具"
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium text-slate-100 leading-snug">{item.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${item.badgeCls}`}>{item.badge}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1.5">⏰ 為什麼是現在：{item.why}</p>
                <p className="text-xs text-amber-400">→ {item.action}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4 text-right">查看全部 → flywheelsea.club</p>
        </div>
      </section>

      {/* ── Before / After 對比 ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-slate-200">用了之後，什麼變了？</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-rose-950/20 border border-slate-800 border-l-4 border-l-rose-500/50 rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-600 mb-4 uppercase tracking-wider">沒有 Flywheel</p>
            <div className="space-y-3">
              {[
                "每天刷 Twitter 1 小時，腦子裡一片空白",
                "看到有趣的事情，不知道該怎麼行動",
                "機會出現了，3 天後才看到",
                "靠運氣決定今天做什麼",
                "信息太多，反而什麼都沒做",
              ].map(t => (
                <div key={t} className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5 shrink-0">✗</span>
                  <span className="text-sm text-slate-500">{t}</span>
                </div>
              ))}
            </div>
          </div>
          {/* After */}
          <div className="bg-emerald-950/20 border border-slate-800 border-l-4 border-l-emerald-500/50 rounded-2xl p-6 shadow-lg shadow-emerald-500/5">
            <p className="text-xs font-mono text-emerald-400 mb-4 uppercase tracking-wider">有了 Flywheel</p>
            <div className="space-y-3">
              {[
                "早上 8 點收到今日值得關注的 3 條機會",
                "每條機會附帶行動清單，打開就知道做什麼",
                "信號實時掃描，機會出現即推送",
                "AI 評分幫你過濾，只看高置信的",
                "5 分鐘決策，剩下的時間用來執行",
              ].map(t => (
                <div key={t} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-slate-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 底部 CTA ── */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-600 text-sm mb-3">目前僅限邀請制 · 名額有限</p>
        <h2 className="text-3xl font-bold mb-4 text-slate-100">今天就開始</h2>
        <p className="text-slate-400 mb-8">
          加入第一批用戶，每天早上 8 點<br/>
          收到你的私人市場情報簡報。
        </p>
        <WaitlistForm />
        <p className="text-xs text-slate-600 mt-4">試用結束後 $19/月，隨時取消</p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 py-8 text-center text-xs text-slate-700">
        © 2026 Flywheel ·{" "}
        <a href="https://t.me/BJMYan" className="hover:text-slate-500 transition-colors">聯繫支持</a>
        {" · "}
        <Link href="/sign-in" className="hover:text-slate-500 transition-colors">登入</Link>
      </footer>

    </div>
  )
}
