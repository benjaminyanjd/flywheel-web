"use client";

import { useEffect, useState } from "react";

export type Lang = "zh" | "en";
const KEY = "flywheel-lang";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Lang | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate from localStorage on mount
    if (stored === "zh" || stored === "en") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    localStorage.setItem(KEY, l);
    setLangState(l);
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("flywheel-lang-change", { detail: l }));
  }

  return [lang, setLang];
}

export function getLangStored(): Lang {
  if (typeof window === "undefined") return "zh";
  return (localStorage.getItem(KEY) as Lang) ?? "zh";
}
