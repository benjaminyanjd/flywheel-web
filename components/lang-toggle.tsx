"use client";

import { useLang } from "@/lib/lang";

export function LangToggle({ className }: { className?: string }) {
  const [lang, setLang] = useLang();
  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      className={`text-xs font-mono text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-gray-400 ${className ?? ""}`}
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}
