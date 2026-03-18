"use client";

import { useLang } from "@/lib/lang";
import { track } from "@/lib/analytics";

function LangIcon({ size = 20, lang }: { size?: number; lang: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Globe */}
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      {/* Language label */}
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        stroke="none"
        fontSize="7"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        {lang === "zh" ? "EN" : "中"}
      </text>
    </svg>
  );
}

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
    >
      <LangIcon size={20} lang={lang} />
    </button>
  );
}
