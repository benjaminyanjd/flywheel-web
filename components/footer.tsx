"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLangStored, type Lang } from "@/lib/lang";

const TEXTS = {
  zh: { contact: "聯繫支持", privacy: "隱私政策", login: "登入" },
  en: { contact: "Contact", privacy: "Privacy", login: "Sign in" },
};

export function Footer() {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    setLang(getLangStored());
    const handler = (e: Event) => setLang((e as CustomEvent<Lang>).detail);
    window.addEventListener("flywheel-lang-change", handler);
    return () => window.removeEventListener("flywheel-lang-change", handler);
  }, []);

  const t = TEXTS[lang];

  return (
    <footer
      className="py-6 text-center text-xs"
      style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
    >
      &copy; 2026 嗅鐘 Sniffing Clock &middot;{" "}
      <a
        href="https://t.me/BJMYan"
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
      <Link href="/sign-in" className="transition-colors hover:text-[var(--text-primary)]">
        {t.login}
      </Link>
    </footer>
  );
}
