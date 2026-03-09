"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/radar", label: "Radar", icon: "📡" },
  { href: "/opportunities", label: "Opportunities", icon: "💎" },
  { href: "/todolist", label: "Todolist", icon: "✅" },
  { href: "/archive", label: "Archive", icon: "🗄️" },
  { href: "/advisor", label: "Advisor", icon: "🧠" },
  { href: "/control", label: "Control", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [signalCount, setSignalCount] = useState<number | null>(null);

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

  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-slate-100">Flywheel</h1>
        <p className="text-xs text-slate-400">Intelligence Dashboard</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => (
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
            <span>{item.label}</span>
            {item.href === "/radar" && signalCount !== null && (
              <span className="ml-auto bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {signalCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
