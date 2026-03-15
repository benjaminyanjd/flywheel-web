"use client";

import { useLang } from "@/lib/lang";

export function LangToggle({ className }: { className?: string }) {
  const [lang, setLang] = useLang();
  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      className={`text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors px-2 py-1 rounded border border-slate-700 hover:border-amber-400 ${className ?? ""}`}
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}
