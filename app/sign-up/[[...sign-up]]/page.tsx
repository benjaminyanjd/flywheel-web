import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left: Product intro */}
      <div className="hidden md:flex flex-col justify-center px-16 w-1/2 border-r border-slate-800">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🌀</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Flywheel</h1>
              <p className="text-slate-400 text-sm">AI 市場情報助理</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">
            每天早 8 點<br/>行動清單直達 Telegram
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            每天早 8 點，把全球信號提煉成你今天可以行動的 3–5 件事。
          </p>
          <div className="space-y-4">
            {[
              { icon: "📡", title: "全源信號掃描", desc: "Reddit · HN · KOL · RSS · GitHub，每天 350+ 條信號" },
              { icon: "💎", title: "AI 機會識別", desc: "自動從噪音中提煉高置信度機會" },
              { icon: "📋", title: "落地方案生成", desc: "每條機會附帶第一步怎麼做" },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-slate-200 font-medium text-sm">{item.title}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-slate-600">
            <span>🔐 僅限邀請碼用戶</span>
            <span>·</span>
            <span>7 天免費試用</span>
          </div>
        </div>
      </div>
      {/* Right: Clerk sign-up */}
      <div className="flex flex-1 items-center justify-center p-8">
        <SignUp
          appearance={{
            baseTheme: undefined,
            variables: { colorBackground: "#1e293b", colorText: "#f1f5f9", colorPrimary: "#6366f1" },
          }}
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
