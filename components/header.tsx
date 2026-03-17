"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState, Suspense, type CSSProperties } from "react";
import { getLangStored, type Lang } from "@/lib/lang";
import { UserButton } from "@clerk/nextjs";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { LangToggle } from "@/components/lang-toggle";
import { useTheme } from "next-themes";
import { ThemeIcon, RadarIcon, OpportunityIcon, TodoListIcon, ArchiveIcon, AdvisorIcon } from "@/components/icons";

function GearIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/radar",         zh: "雷達",    en: "Radar" },
  { href: "/opportunities", zh: "機會捕捉", en: "Opportunities" },
  { href: "/todolist",      zh: "待辦清單", en: "Todolist" },
  { href: "/archive",       zh: "歸檔",    en: "Archive" },
  { href: "/advisor",       zh: "顧問",    en: "Advisor" },
  { href: "/control",       zh: "🔒 掃描中心", en: "🔒 Scan Center" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
      title={isDark ? "亮色模式" : "暗色模式"}
    >
      <ThemeIcon size={20} isDark={isDark}/>
    </button>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const [lang, setLangState] = useState<Lang>("zh");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    setLangState(getLangStored());
    const handler = (e: Event) => setLangState((e as CustomEvent<Lang>).detail);
    window.addEventListener("flywheel-lang-change", handler);
    return () => window.removeEventListener("flywheel-lang-change", handler);
  }, []);

  useEffect(() => {
    fetch("/api/user/trial")
      .then((r) => r.json())
      .then((d) => {
        if (d.daysLeft !== null) setDaysLeft(d.daysLeft);
      })
      .catch(() => {});
  }, []);

  const tabCls = (active: boolean) =>
    cn(
      "flex-1 flex flex-col items-center justify-center py-2 transition-colors text-xs",
      active
        ? "text-[var(--text-primary)] font-semibold"
        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
    );

  return (
    <>
      {/* Top header bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-4"
        style={{
          backgroundColor: "var(--bg-panel)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Logo */}
        <Link href="/radar" className="flex items-center gap-2 shrink-0">
          <FlywheelLogo
            size={30}
            style={{ color: "var(--signal)" }}
          />
          <span className="font-bold text-base hidden sm:block" style={{ color: "var(--text-primary)" }}>
            {lang === "en" ? "Sniffing Clock" : "嗅鐘"}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "font-medium"
                    : "hover:bg-[var(--border-subtle)]"
                )}
                style={{
                  backgroundColor: isActive ? "var(--border-subtle)" : undefined,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {lang === "zh" ? item.zh : item.en}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Trial warning (desktop) */}
          {daysLeft !== null && daysLeft <= 7 && (
            <a
              href="/expired"
              className={cn(
                "hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors",
                daysLeft <= 2
                  ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                  : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400"
              )}
            >
              <span>🕐</span>
              <span>{daysLeft} 天試用</span>
            </a>
          )}
          <LangToggle className="hidden md:block" />
          <ThemeToggle />
          <Link
            href="/settings"
            className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
            title="設定"
            style={{ color: "var(--text-secondary)" }}
          >
            <GearIcon size={20} />
          </Link>
          <UserButton />
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          backgroundColor: "var(--bg-panel)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <Link href="/radar" className={tabCls(pathname.startsWith("/radar"))}>
          <RadarIcon size={20} style={{ color: pathname.startsWith("/radar") ? "var(--signal)" : "var(--text-muted)" }} />
          <span style={{ fontSize: "10px" }} className="mt-0.5">{lang === "zh" ? "雷達" : "Radar"}</span>
        </Link>
        <Link href="/opportunities" className={tabCls(pathname.startsWith("/opportunities"))}>
          <OpportunityIcon size={20} style={{ color: pathname.startsWith("/opportunities") ? "var(--signal)" : "var(--text-muted)" }} />
          <span style={{ fontSize: "10px" }} className="mt-0.5">{lang === "zh" ? "機會" : "Opps"}</span>
        </Link>
        <Link href="/todolist" className={tabCls(pathname.startsWith("/todolist"))}>
          <TodoListIcon size={20} style={{ color: pathname.startsWith("/todolist") ? "var(--signal)" : "var(--text-muted)" }} />
          <span style={{ fontSize: "10px" }} className="mt-0.5">{lang === "zh" ? "待辦" : "Todo"}</span>
        </Link>
        <Link href="/archive" className={tabCls(pathname.startsWith("/archive"))}>
          <ArchiveIcon size={20} style={{ color: pathname.startsWith("/archive") ? "var(--signal)" : "var(--text-muted)" }} />
          <span style={{ fontSize: "10px" }} className="mt-0.5">{lang === "zh" ? "歸檔" : "Archive"}</span>
        </Link>
        <Link
          href="/advisor"
          className={tabCls(pathname.startsWith("/advisor"))}
        >
          <AdvisorIcon size={20} style={{ color: pathname.startsWith("/advisor") ? "var(--signal)" : "var(--text-muted)" }} />
          <span style={{ fontSize: "10px" }} className="mt-0.5">{lang === "zh" ? "顧問" : "Advisor"}</span>
        </Link>
        <Link
          href="/settings"
          className={tabCls(pathname.startsWith("/settings") || pathname.startsWith("/control"))}
        >
          <span style={{ color: (pathname.startsWith("/settings") || pathname.startsWith("/control")) ? "var(--signal)" : "var(--text-muted)" } as CSSProperties}><GearIcon size={20} /></span>
          <span style={{ fontSize: "10px" }} className="mt-0.5">{lang === "zh" ? "設定" : "Settings"}</span>
        </Link>
      </div>
    </>
  );
}

export function Header() {
  return (
    <Suspense
      fallback={
        <header
          className="fixed top-0 left-0 right-0 z-50 h-14"
          style={{ backgroundColor: "var(--bg-panel)", borderBottom: "1px solid var(--border-subtle)" }}
        />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
