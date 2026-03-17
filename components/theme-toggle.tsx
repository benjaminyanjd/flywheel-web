"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeIcon } from "@/components/icons";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount init
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: mount flag
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors ${className ?? ""}`}
      title={isDark ? "亮色模式" : "暗色模式"}
    >
      <ThemeIcon size={20} isDark={isDark} />
    </button>
  );
}
