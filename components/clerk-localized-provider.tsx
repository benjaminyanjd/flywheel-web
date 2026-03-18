"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { zhTW } from "@clerk/localizations";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/lang";

export function ClerkLocalizedProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("flywheel-lang")) as Lang | null;
    if (stored === "en" || stored === "zh") setLang(stored);

    const handler = (e: Event) => setLang((e as CustomEvent<Lang>).detail);
    window.addEventListener("flywheel-lang-change", handler);
    return () => window.removeEventListener("flywheel-lang-change", handler);
  }, []);

  return (
    <ClerkProvider
      key={lang}
      localization={lang === "zh" ? zhTW : undefined}
    >
      {children}
    </ClerkProvider>
  );
}
