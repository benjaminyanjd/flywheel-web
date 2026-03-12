import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export default async function ExpiredPage() {
  const { userId } = await auth();
  const db = getDb();

  // 取用戶統計
  let stats = { totalOpps: 0, actionedOpps: 0, trialStart: null as string | null };
  if (userId) {
    const sub = db.prepare("SELECT created_at FROM user_subscriptions WHERE user_id = ?").get(userId) as any;
    stats.trialStart = sub?.created_at ?? null;
    stats.totalOpps = (db.prepare("SELECT COUNT(*) as c FROM opportunity_actions WHERE user_id = ? OR user_id = 'system'").get(userId) as any)?.c ?? 0;
    stats.actionedOpps = (db.prepare("SELECT COUNT(*) as c FROM opportunity_actions WHERE action IN ('action','done') AND (user_id = ? OR user_id = 'system')").get(userId) as any)?.c ?? 0;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">試用期已結束</h1>
        <p className="text-slate-400 mb-6">你的 7 天免費試用已到期。</p>

        {/* 用戶試用期間數據 */}
        <div className="bg-slate-800 rounded-xl p-5 mb-6 text-left border border-slate-700">
          <p className="text-sm text-slate-400 mb-3">📊 你的試用報告</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{stats.totalOpps}</div>
              <div className="text-xs text-slate-500 mt-1">共識別機會</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{stats.actionedOpps}</div>
              <div className="text-xs text-slate-500 mt-1">已行動機會</div>
            </div>
          </div>
        </div>

        {/* 定價 */}
        <div className="bg-slate-800 rounded-xl p-5 mb-6 border border-amber-500/30 text-left">
          <p className="text-sm font-semibold text-amber-400 mb-3">🚀 正式版方案</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-200 font-medium">月度訂閱</p>
                <p className="text-xs text-slate-500">無限信號掃描 + AI機會識別 + Telegram推送</p>
              </div>
              <span className="text-xl font-bold text-slate-100">$19.9<span className="text-sm text-slate-400">/月</span></span>
            </div>
            <hr className="border-slate-700" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-200 font-medium">年度訂閱 <span className="text-xs bg-emerald-700 text-emerald-200 px-1.5 py-0.5 rounded ml-1">省 16%</span></p>
                <p className="text-xs text-slate-500">全部功能 + 優先新功能體驗</p>
              </div>
              <span className="text-xl font-bold text-slate-100">$199<span className="text-sm text-slate-400">/年</span></span>
            </div>
          </div>
        </div>

        <a
          href="https://t.me/BJMYan"
          className="inline-block w-full bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-lg font-medium transition-colors mb-3"
        >
          聯繫獲取正式授權 →
        </a>
        <p className="text-xs text-slate-600">發送邀請碼給好友，雙方各得 1 個月</p>
      </div>
    </div>
  );
}
