"use client";

import { useLang } from "@/lib/lang";
import { track } from "@/lib/analytics";

export function LangToggle({ className }: { className?: string }) {
  const [lang, setLang] = useLang();
  return (
    <button
      onClick={() => {
        const newLang = lang === "zh" ? "en" : "zh";
        track("lang_toggle", { to: newLang });
        setLang(newLang);
      }}
      className={`p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors ${className ?? ""}`}
      title={lang === "zh" ? "Switch to English" : "切換為中文"}
      style={{ color: "var(--text-secondary)" }}
    >
      <span className="text-xs font-semibold leading-none select-none" style={{ display: "block", width: 20, height: 20, lineHeight: "20px", textAlign: "center" }}>
        {lang === "zh" ? "EN" : "中"}
      </span>
    </button>
  );
}
