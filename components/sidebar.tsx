"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState, Suspense } from "react";
import { getLangStored, useLang, type Lang } from "@/lib/lang";
import { useT } from "@/lib/i18n";
import { UserButton, useUser } from "@clerk/nextjs";
import { FlywheelLogo } from "@/components/flywheel-logo";

const RADAR_CATEGORIES = [
  { value: "ai_tech",         zh: "AI 科技",  en: "AI Tech",  icon: "🤖" },
  { value: "crypto_policy",   zh: "加密政策", en: "Crypto",   icon: "₿" },
  { value: "new_tools",       zh: "新工具",   en: "New Tools",icon: "🔧" },
  { value: "overseas_trends", zh: "海外趋势", en: "Overseas", icon: "🌍" },
  { value: "x_kol",           zh: "KOL",      en: "KOL",      icon: "⭐" },
];

const OTHER_NAV: { href: string; zh: string; en: string; icon: string }[] = [
  { href: "/opportunities", zh: "机会捕捉", en: "Opportunities", icon: "💎" },
  { href: "/todolist",      zh: "待办清单",  en: "Todolist",     icon: "✅" },
  { href: "/archive",       zh: "归档记录",  en: "Archive",      icon: "🗄️" },
  { href: "/advisor",       zh: "顾问",      en: "Advisor",      icon: "🧠" },
  { href: "/control",       zh: "掃描中心",    en: "Scan Center",      icon: "🔍" },
  { href: "/settings",      zh: "设置",      en: "Settings",     icon: "🔧" },
];

const RADAR_LABEL = { zh: "雷达", en: "Radar" };

function SidebarInner() {
  const { t } = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [signalCount, setSignalCount] = useState<number | null>(null);
  const [radarOpen, setRadarOpen] = useState(pathname.startsWith("/radar"));
  const [isMobile, setIsMobile] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeCategory = searchParams.get("category") ?? "all";
  const isRadarActive = pathname.startsWith("/radar");
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    setLangState(getLangStored());
    const handler = (e: Event) => setLangState((e as CustomEvent<Lang>).detail);
    window.addEventListener("flywheel-lang-change", handler);
    return () => window.removeEventListener("flywheel-lang-change", handler);
  }, []);

  useEffect(() => {
    if (isRadarActive) setRadarOpen(true);
  }, [isRadarActive]);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setSignalCount(data.todayCount ?? 0);
        }
      } catch {}
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/user/trial").then(r => r.json()).then(d => {
      if (d.daysLeft !== null) setDaysLeft(d.daysLeft);
    }).catch(() => {});
  }, []);

  const tabCls = (active: boolean) => cn(
    "flex-1 flex flex-col items-center justify-center py-2 transition-colors text-xs",
    active ? "text-indigo-400 bg-slate-700/50" : "text-slate-400 hover:text-slate-200"
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700 flex">
        <Link href="/radar" className={tabCls(pathname.startsWith("/radar"))}>
          <span className="text-xl">📡</span>
          <span className="text-xs mt-0.5">{lang === "zh" ? "雷达" : "Radar"}</span>
        </Link>
        <Link href="/opportunities" className={tabCls(pathname.startsWith("/opportunities"))}>
          <span className="text-xl">💎</span>
          <span className="text-xs mt-0.5">{lang === "zh" ? "机会" : "Opps"}</span>
        </Link>
        <Link href="/todolist" className={tabCls(pathname.startsWith("/todolist"))}>
          <span className="text-xl">✅</span>
          <span className="text-xs mt-0.5">{lang === "zh" ? "待办" : "Todo"}</span>
        </Link>
        <Link href="/archive" className={tabCls(pathname.startsWith("/archive"))}>
          <span className="text-xl">🗄️</span>
          <span className="text-xs mt-0.5">{lang === "zh" ? "归档" : "Archive"}</span>
        </Link>
        <Link href="/advisor" className={tabCls(pathname.startsWith("/advisor") || pathname.startsWith("/control"))}>
          <span className="text-xl">⚙️</span>
          <span className="text-xs mt-0.5">{lang === "zh" ? "更多" : "More"}</span>
        </Link>
      </div>
    );
  }

  return (
    <aside className="hidden md:flex w-56 bg-slate-800 border-r border-slate-700 flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <FlywheelLogo size={22} className="text-amber-400 animate-[spin_8s_linear_infinite] shrink-0" />
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight">Flywheel</h1>
            <p className="text-[10px] text-slate-500 leading-tight">{t("sidebar_subtitle")}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {/* Radar — expandable */}
        <div>
          <button
            onClick={() => setRadarOpen((o) => !o)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isRadarActive
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
            )}
          >
            <span>📡</span>
            <span className="flex-1 text-left">{RADAR_LABEL[lang]}</span>
            <span className={cn(
              "text-xs text-slate-500 transition-transform duration-200",
              radarOpen ? "rotate-180" : ""
            )}>▾</span>
          </button>

          {radarOpen && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700 pl-3">
              {RADAR_CATEGORIES.map((cat) => {
                const href = `/radar?category=${cat.value}`;
                const isActive = isRadarActive && activeCategory === cat.value;
                return (
                  <Link
                    key={cat.value}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors",
                      isActive
                        ? "bg-slate-600/80 text-slate-100 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                    )}
                  >
                    <span className="text-slate-500">{cat.icon}</span>
                    <span>{lang === "zh" ? cat.zh : cat.en}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Other nav items */}
        {OTHER_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
            )}
          >
            <span>{item.icon}</span>
            <span>{lang === "zh" ? item.zh : item.en}</span>
          </Link>
        ))}
        {/* Feedback link */}
        <a
          href="https://t.me/BJMYan"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
        >
          <span>💬</span>
          <span>{t ? t("feedback") : "反饋建議"}</span>
        </a>
      </nav>

      {user && (
        <div className="px-3 py-2 text-xs text-slate-500 truncate border-t border-slate-800">
          {user.firstName || user.emailAddresses[0]?.emailAddress}
        </div>
      )}
      {daysLeft !== null && daysLeft <= 7 && (
        <div className="px-3 pb-2">
          <a href="/expired" className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${
            daysLeft <= 2 ? "bg-red-900/30 text-red-400 hover:bg-red-900/50" : "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
          }`}>
            <span>🕐</span>
            <span>試用剩 {daysLeft} 天</span>
          </a>
        </div>
      )}
      <div className="p-4 border-t border-slate-700">
        <UserButton />
      </div>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-56 bg-slate-800 border-r border-slate-700 h-screen" />}>
      <SidebarInner />
    </Suspense>
  );
}
