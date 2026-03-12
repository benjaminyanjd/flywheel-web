import { SignUp } from "@clerk/nextjs";
import { FlywheelLogo } from "@/components/flywheel-logo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Left: Product intro */}
      <div className="flex flex-col justify-center px-8 py-10 md:px-16 md:w-1/2 border-b md:border-b-0 md:border-r border-slate-800">
        <div className="max-w-md mx-auto w-full">
          {/* Logo + title: always visible */}
          <div className="flex items-center gap-3 mb-4">
            <FlywheelLogo size={28} className="text-amber-400 animate-[spin_8s_linear_infinite]" />
            <div>
              <h1 className="text-xl font-bold text-slate-100">Flywheel</h1>
              <p className="text-slate-400 text-xs">AI 市場情報助理</p>
            </div>
          </div>

          {/* Main headline: always visible */}
          <h2 className="text-2xl font-bold text-slate-100 mb-3 leading-tight">
            每天早 8 點<br/>行動清單直達 Telegram
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            每天早 8 點，把全球信號提煉成你今天可以行動的 3–5 件事。
          </p>

          {/* Feature list: md+ only */}
          <div className="hidden md:block space-y-4">
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

          {/* Bottom tags: always visible */}
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-600 flex-wrap">
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
