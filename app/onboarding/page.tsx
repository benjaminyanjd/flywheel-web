"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = [
  { value: "ai_tech", label: "🤖 AI 科技" },
  { value: "crypto_policy", label: "₿ 加密政策" },
  { value: "new_tools", label: "🔧 新工具" },
  { value: "overseas_trends", label: "🌍 海外趨勢" },
  { value: "x_kol", label: "⭐ KOL 動態" },
];

const INTERVALS = [
  { value: 30, label: "每 30 分鐘" },
  { value: 60, label: "每 1 小時" },
  { value: 180, label: "每 3 小時" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [categories, setCategories] = useState(["ai_tech", "crypto_policy", "new_tools"]);
  const [scanInterval, setScanInterval] = useState(60);
  const [saving, setSaving] = useState(false);

  async function validateInvite() {
    setInviteError("");
    setInviteLoading(true);
    try {
      const res = await fetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "驗證失敗");
      } else {
        setStep(1);
      }
    } catch {
      setInviteError("網絡錯誤，請重試");
    } finally {
      setInviteLoading(false);
    }
  }

  function toggleCategory(val: string) {
    setCategories(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
  }

  async function finish() {
    setSaving(true);
    await fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categories,
        scan_interval: scanInterval,
      }),
    });
    // Trigger initial scan (fire-and-forget, don't await)
    fetch("/api/scan", { method: "POST" }).catch(() => {});
    router.push("/opportunities?welcome=1");
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-indigo-500" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">🔑 輸入邀請碼</CardTitle>
              <p className="text-slate-400 text-sm">
                Flywheel 目前僅限受邀用戶使用，請輸入你的邀請碼開始 7 天免費試用
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="FLYWHEEL-XXXXX-XXX"
                className="bg-slate-700 border-slate-600 text-slate-100 font-mono uppercase tracking-widest"
                onKeyDown={e => e.key === "Enter" && validateInvite()}
              />
              {inviteError && <p className="text-red-400 text-sm">{inviteError}</p>}
              <Button
                onClick={validateInvite}
                disabled={!inviteCode || inviteLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500"
              >
                {inviteLoading ? "驗證中..." : "驗證邀請碼 →"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">📡 選擇關注方向</CardTitle>
              <p className="text-slate-400 text-sm">Flywheel 將優先為你掃描以下話題的信號</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    categories.includes(cat.value)
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <Button
                onClick={() => setStep(2)}
                disabled={categories.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 mt-2"
              >
                下一步 →
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">⏱️ 掃描頻率</CardTitle>
              <p className="text-slate-400 text-sm">Flywheel 多久為你掃描一次新信號？</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {INTERVALS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setScanInterval(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    scanInterval === opt.value
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <Button
                onClick={finish}
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 mt-2"
              >
                {saving ? "保存中..." : "開始使用 →"}
              </Button>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}
