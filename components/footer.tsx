"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getLangStored, type Lang } from "@/lib/lang";

const HIDDEN_PATHS = ["/onboarding", "/welcome"];

const TEXTS = {
  zh: { contact: "聯繫支持", privacy: "隱私政策", login: "登入" },
  en: { contact: "Contact", privacy: "Privacy", login: "Sign in" },
};

function TelegramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "-2px" }}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "-2px" }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    setLang(getLangStored());
    const handler = (e: Event) => setLang((e as CustomEvent<Lang>).detail);
    window.addEventListener("flywheel-lang-change", handler);
    return () => window.removeEventListener("flywheel-lang-change", handler);
  }, []);

  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  const t = TEXTS[lang];

  return (
    <footer
      className="py-6 text-center text-xs mt-auto"
      style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
    >
      &copy; 2026 嗅鐘 Sniffing Clock &middot;{" "}
      <a
        href="https://t.me/+YPHT-FqxidA5NmU1"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[var(--text-primary)]"
      >
        {t.contact}
      </a>
      {" · "}
      <Link href="/privacy" className="transition-colors hover:text-[var(--text-primary)]">
        {t.privacy}
      </Link>
      {" · "}
      <a
        href="https://t.me/+IPP9J7giS0Q5NmQ1"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[var(--text-primary)]"
        title="Telegram"
      >
        <TelegramIcon />
      </a>
      {"  "}
      <span style={{ display: "inline-block", width: 8 }} />
      <a
        href="https://x.com/SniffingClock"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-[var(--text-primary)]"
        title="X / Twitter"
      >
        <XIcon />
      </a>
    </footer>
  );
}
