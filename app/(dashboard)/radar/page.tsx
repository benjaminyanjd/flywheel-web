"use client";

import React, { useEffect, useRef, useState, Suspense, useCallback, useDeferredValue, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { useToast } from "@/components/toast";
import { track } from "@/lib/analytics";
import { CATEGORY_ICONS, CATEGORY_GROUPS, LEGACY_CATEGORY_MAP, getCategoryBadgeColor } from "@/components/category-icons";

interface Signal {
  id: number;
  source: string;
  title: string;
  url: string;
  description: string;
  category: string;
  heat_score: number;
  monetize_score: number;
  window: string;
  created_at: string;
}

function relativeTime(dateStr: string, lang: string): string {
  // SQLite stores UTC without Z suffix; append Z so browsers parse as UTC
  const normalized = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60000);
  if (lang === "zh") {
    if (mins < 1) return "剛剛";
    if (mins < 60) return `${mins} 分鐘前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小時前`;
    const days = Math.floor(hours / 24);
    return `${days} 天前`;
  } else {
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

function HeatIcon({ score }: { score: number }) {
  if (score >= 5) return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="inline-block text-orange-500">
      <path d="M12 2c0 0-6 6.67-6 12a6 6 0 0012 0c0-5.33-6-12-6-12zm0 16a4 4 0 01-4-4c0-2.67 2-5.67 4-8 2 2.33 4 5.33 4 8a4 4 0 01-4 4z"/>
    </svg>
  );
  if (score >= 3) return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block text-yellow-500">
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline-block text-gray-400">
      <path d="M4 12h2M6 8h2M10 6h4M14 8h2M18 12h2"/>
      <path d="M6 16c2-2 4-2 6-2s4 0 6 2"/>
    </svg>
  );
}

function heatLabel(score: number, lang: string): string {
  const labels = {
    zh: { hot: "熱門", watch: "關注", normal: "一般" },
    en: { hot: "Hot", watch: "Notable", normal: "Normal" },
  };
  const l = labels[lang as "zh" | "en"] ?? labels.en;
  if (score >= 5) return l.hot;
  if (score >= 3) return l.watch;
  return l.normal;
}

function sourceBadgeStyle(source: string): { cls: string; label: string } {
  const map: Record<string, { cls: string; label: string }> = {
    reddit:          { cls: "bg-orange-500/10 text-orange-500 border border-orange-500/30", label: "R Reddit" },
    hacker_news:     { cls: "bg-red-500/10 text-red-500 border border-red-500/30",          label: "Y HN" },
    rss:             { cls: "bg-blue-500/10 text-blue-500 border border-blue-500/30",        label: "◉ RSS" },
    kol_tweet:       { cls: "border text-[var(--text-secondary)] bg-[var(--bg-panel)]",      label: "✕ KOL" },
    x_kol:           { cls: "border text-[var(--text-secondary)] bg-[var(--bg-panel)]",      label: "✕ KOL" },
    alpha_rising:    { cls: "bg-rose-500/10 text-rose-500 border border-rose-500/30",        label: "Alpha" },
    hl_whale:        { cls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30", label: "🐋 Whale" },
    coingecko_trending: { cls: "bg-green-500/10 text-green-500 border border-green-500/30",  label: "🦎 CG" },
    github_trending: { cls: "bg-purple-500/10 text-purple-500 border border-purple-500/30", label: "⬡ GitHub" },
  }
  return map[source] || { cls: "border text-[var(--text-muted)] bg-[var(--bg-panel)]", label: source }
}

// Signal card action icons — 14x14
function IconCopy({ copied }: { copied: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {copied ? (
        <polyline points="20 6 9 17 4 12"/>
      ) : (
        <>
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </>
      )}
    </svg>
  );
}

function IconBookmark({ bookmarked }: { bookmarked: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function heatScoreBg(score: number): string {
  if (score >= 5) return "bg-orange-500/10 text-orange-500 border border-orange-500/30";
  if (score >= 3) return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30";
  return "border text-[var(--text-muted)] bg-[var(--bg-panel)]";
}

/** Left border + bg highlight classes based on heat_score */
function heatHighlightClass(score: number, isBookmarked: boolean): string {
  if (isBookmarked) return "border-l-2 border-l-[var(--signal)]";
  if (score >= 8) return "border-l-[3px] border-l-orange-400";
  if (score >= 5) return "border-l-2 border-l-yellow-300";
  return "";
}

const CATEGORY_LABELS: Record<string, { zh: string; en: string }> = {
  funding_rate:  { zh: "資金費率",  en: "Funding Rate" },
  liquidation:   { zh: "爆倉清算",  en: "Liquidation" },
  whale_move:    { zh: "鯨魚動向",  en: "Whale Moves" },
  kol_call:      { zh: "KOL 喊單",  en: "KOL Calls" },
  onchain_flow:  { zh: "鏈上資金",  en: "On-chain Flow" },
  token_launch:  { zh: "新幣發射",  en: "Token Launch" },
  airdrop_opp:   { zh: "空投機會",  en: "Airdrop" },
  listing:       { zh: "上幣公告",  en: "New Listing" },
  spread:        { zh: "套利價差",  en: "Arbitrage Spread" },
  security:      { zh: "安全預警",  en: "Security Alert" },
  macro:         { zh: "宏觀政策",  en: "Macro & Policy" },
  defi_yield:    { zh: "DeFi 收益", en: "DeFi Yield" },
  // Legacy fallbacks
  kol:           { zh: "KOL 喊單",  en: "KOL Calls" },
  crypto_news:   { zh: "上幣公告",  en: "New Listing" },
  onchain:       { zh: "鏈上資金",  en: "On-chain Flow" },
  ai_tech:       { zh: "宏觀政策",  en: "Macro & Policy" },
  community:     { zh: "安全預警",  en: "Security Alert" },
  alpha:         { zh: "套利價差",  en: "Arbitrage Spread" },
};

// Map user_focus values to signal categories
const FOCUS_TO_CATEGORY: Record<string, string[]> = {
  ai: ["macro", "token_launch"],
  crypto: ["listing", "onchain_flow", "funding_rate"],
  saas: ["macro", "defi_yield"],
  overseas: ["security", "macro"],
};

// "All" tab icon
function IconAll() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

// Build grouped radar category list from CATEGORY_GROUPS
const RADAR_CATEGORIES_GROUPED = CATEGORY_GROUPS.map((group) => ({
  ...group,
  items: group.categories.map((cat) => ({
    value: cat,
    zh: CATEGORY_LABELS[cat]?.zh ?? cat,
    en: CATEGORY_LABELS[cat]?.en ?? cat,
    icon: CATEGORY_ICONS[cat] ? React.createElement(CATEGORY_ICONS[cat]!, { size: 14 }) : null,
  })),
}));

function RadarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category") ?? "all";
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [heatFilter, setHeatFilter] = useState<"all" | "high" | "mid" | "low">("mid");
  const [keyword, setKeyword] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<Set<string>>(new Set());
  const { t, lang } = useT();
  const toast = useToast();
  const [translations, setTranslations] = useState<Record<number, { title: string; description: string }>>({});
  const [translating, setTranslating] = useState(false);
  const prevTranslating = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [listOpacity, setListOpacity] = useState(1);
  const scrollKey = "scroll_radar";
  // Defer keyword filtering to avoid blocking keystrokes
  const deferredKeyword = useDeferredValue(keyword);

  // Load from localStorage cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("flywheel-tr-cache");
      if (cached) setTranslations(JSON.parse(cached));
    } catch {}
  }, []);

  // Toast for translation status
  useEffect(() => {
    if (translating && !prevTranslating.current) {
      toast(t("radar_translating"), "info");
    }
    if (!translating && prevTranslating.current) {
      toast(t("radar_translate_done"), "success");
    }
    prevTranslating.current = translating;
  }, [translating, toast]);

  const translateSignals = useCallback(async (toTranslate: Signal[]) => {
    if (!toTranslate.length) return;
    setTranslating(true);
    try {
      const BATCH = 9; // titles+descriptions per signal = 2 texts each, max 18 per API call
      const allTranslated: Record<number, { title: string; description: string }> = {};
      for (let i = 0; i < toTranslate.length; i += BATCH) {
        const batch = toTranslate.slice(i, i + BATCH);
        const titles = batch.map((s) => s.title);
        const descriptions = batch.map((s) => s.description || "");
        const allTexts = [...titles, ...descriptions]; // 9+9=18, within limit
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: allTexts }),
        }).then((r) => r.json());
        batch.forEach((s, j) => {
          allTranslated[s.id] = {
            title: res.translations?.[j] || s.title,
            description: res.translations?.[j + batch.length] || s.description,
          };
        });
        setTranslations((prev) => {
          const next = { ...prev, ...allTranslated };
          try { localStorage.setItem("flywheel-tr-cache", JSON.stringify(next)); } catch {}
          return next;
        });
      }
    } catch (err) {
      console.error("radar/translateSignals:", err);
    } finally {
      setTranslating(false);
    }
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(scrollKey)
    if (saved) {
      setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: "instant" }), 100)
      sessionStorage.removeItem(scrollKey)
    }
  }, [])

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => sessionStorage.setItem(scrollKey, String(window.scrollY))
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Load user preferences for category highlighting
  useEffect(() => {
    fetch("/api/user/settings")
      .then(r => r.json())
      .then(data => {
        if (data?.user_focus) {
          const focusValues = data.user_focus.split(",").map((f: string) => f.trim());
          const cats = new Set<string>();
          for (const f of focusValues) {
            const mapped = FOCUS_TO_CATEGORY[f];
            if (mapped) mapped.forEach(c => cats.add(c));
            if (f === "all") Object.values(FOCUS_TO_CATEGORY).flat().forEach(c => cats.add(c));
          }
          setPreferredCategories(cats);
        }
      })
      .catch((err) => console.error("radar/fetchUserSettings:", err));
  }, []);

  useEffect(() => {
    fetch("/api/signals?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSignals(data);
        else if (data.signals) setSignals(data.signals);
      })
      .catch((err) => console.error("radar/fetchSignals:", err))
      .finally(() => setLoading(false));
    // Load bookmarks
    fetch("/api/signals/bookmarks").then(r => r.json()).then((ids: number[]) => setBookmarks(new Set(ids))).catch((err) => console.error("radar/fetchBookmarks:", err));
  }, []);

  // When switching to a specific category, also fetch that category's latest signals
  useEffect(() => {
    if (activeCategory === "all") return;
    fetch(`/api/signals?limit=50&category=${activeCategory}`)
      .then((res) => res.json())
      .then((data) => {
        const catSignals: Signal[] = Array.isArray(data) ? data : (data.signals ?? []);
        setSignals((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newOnes = catSignals.filter((s) => !existingIds.has(s.id));
          return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
        });
      })
      .catch((err) => console.error("radar/fetchCategorySignals:", err));
  }, [activeCategory]);

  useEffect(() => {
    const es = new EventSource("/api/signals/stream");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const newSignal: Signal = JSON.parse(event.data);
        setSignals((prev) => {
          if (prev.some((s) => s.id === newSignal.id)) return prev;
          return [newSignal, ...prev];
        });
        setNewIds((prev) => new Set(prev).add(newSignal.id));
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev);
            next.delete(newSignal.id);
            return next;
          });
        }, 2000);
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      es.close();
    };
  }, []);

  // Auto-translate when lang=zh and there are untranslated visible signals
  useEffect(() => {
    if (lang !== "zh" || !signals.length) return;
    const toTranslate = signals.filter((s) => !translations[s.id]);
    if (toTranslate.length > 0) translateSignals(toTranslate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, signals]);

  // IX10: fade animation on filter change
  const prevFilterRef = useRef({ activeCategory, heatFilter, deferredKeyword });
  useEffect(() => {
    const prev = prevFilterRef.current;
    if (prev.activeCategory !== activeCategory || prev.heatFilter !== heatFilter || prev.deferredKeyword !== deferredKeyword) {
      prevFilterRef.current = { activeCategory, heatFilter, deferredKeyword };
      setListOpacity(0);
      setTimeout(() => setListOpacity(1), 10);
    }
  }, [activeCategory, heatFilter, deferredKeyword]);

  // useMemo avoids re-filtering on unrelated state changes (e.g. copiedId, bookmarks UI)
  const filtered = useMemo(() => {
    const base = signals.filter((s) => {
      if (!s.title || s.title === "null") return false;
      if (activeCategory !== "all" && s.category !== activeCategory) return false;
      if (heatFilter === "high") return s.heat_score >= 5;
      if (heatFilter === "mid") return s.heat_score >= 3;
      if (heatFilter === "low") return s.heat_score < 3;
      return true;
    }).filter((s) => {
      if (!deferredKeyword.trim()) return true;
      const kw = deferredKeyword.trim().toLowerCase();
      const origTitle = s.title || "";
      const origDesc = s.description || "";
      const transTitle = translations[s.id]?.title || "";
      const transDesc = translations[s.id]?.description || "";
      return (origTitle + origDesc + transTitle + transDesc).toLowerCase().includes(kw);
    });
    // Sort preferred categories first when viewing "all", then by time desc
    if (activeCategory === "all" && preferredCategories.size > 0) {
      base.sort((a, b) => {
        const aPref = preferredCategories.has(a.category) ? 0 : 1;
        const bPref = preferredCategories.has(b.category) ? 0 : 1;
        if (aPref !== bPref) return aPref - bPref;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      base.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return base;
  }, [signals, activeCategory, heatFilter, deferredKeyword, lang, translations, preferredCategories]);

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("radar_title")}</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
              <div className="h-4 skeleton-shimmer rounded w-2/3 mb-3" />
              <div className="h-3 skeleton-shimmer rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      {/* Category grouped tabs */}
      <div className="flex items-center gap-0 mb-4 overflow-x-auto pb-1 flex-wrap" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        {/* "All" tab */}
        <button
          type="button"
          onClick={() => { track("signal_filter", { category: "all" }); router.push("/radar"); }}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap transition-all duration-200 ${
            activeCategory === "all"
              ? "font-semibold text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span className="leading-none" style={{ color: activeCategory === "all" ? "var(--signal)" : "var(--text-muted)" }}><IconAll /></span>
          <span>{lang === "zh" ? "全部" : "All"}</span>
          {activeCategory === "all" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "var(--signal)" }} />
          )}
        </button>
        {RADAR_CATEGORIES_GROUPED.map((group, gi) => (
          <React.Fragment key={group.key}>
            {/* Group separator */}
            <span className="mx-1 h-4 w-px shrink-0" style={{ backgroundColor: "var(--border)" }} />
            <span className="text-[10px] uppercase tracking-wider px-1 shrink-0" style={{ color: "var(--text-muted)" }}>
              {lang === "zh" ? group.zh : group.en}
            </span>
            {group.items.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { track("signal_filter", { category: cat.value }); router.push(`/radar?category=${cat.value}`); }}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-sm whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "font-semibold text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="leading-none" style={{ color: isActive ? "var(--signal)" : "var(--text-muted)" }}>{cat.icon}</span>
                  <span>{lang === "zh" ? cat.zh : cat.en}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "var(--signal)" }} />
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Header row: title + count */}
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("radar_title")}</h1>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: "var(--bg-panel)", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
          {filtered.length}
        </span>
      </div>

      {/* Filter row: search + heat pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Keyword search */}
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t("radar_search")}
            aria-label={t("radar_search")}
            className="rounded-xl px-3 py-1.5 text-sm w-48 input-focus-ring focus:outline-none border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)", paddingRight: keyword ? "2rem" : undefined }}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              aria-label="清除搜尋"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-sm leading-none"
            >
              ✕
            </button>
          )}
        </div>
        {/* Heat score filter pills */}
        {([
          { key: "all",  label: t("common_all"), ariaLabel: t("common_all") },
          { key: "high", label: "≥5",             ariaLabel: "高熱度 (≥5)" },
          { key: "mid",  label: "≥3",             ariaLabel: "值得關注 (≥3)" },
          { key: "low",  label: "<3",             ariaLabel: "低熱度 (<3)" },
        ] as const).map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setHeatFilter(pill.key)}
            aria-label={pill.ariaLabel}
            aria-pressed={heatFilter === pill.key}
            className={`rounded-full border px-2.5 py-1 text-xs whitespace-nowrap transition-all duration-200 ${
              heatFilter === pill.key
                ? "font-medium"
                : "hover:text-[var(--text-primary)]"
            }`}
            style={heatFilter === pill.key
              ? { backgroundColor: "var(--signal)", color: "var(--bg)", borderColor: "var(--signal)" }
              : { borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "transparent" }
            }
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Today's summary */}
      {(() => {
        const today = new Date().toLocaleDateString("zh-TW");
        // Use filtered (current category view) for stats, not raw signals
        const todayCount = filtered.filter(s => {
          const d = s.created_at.endsWith("Z") || s.created_at.includes("+") ? s.created_at : s.created_at + "Z";
          return new Date(d).toLocaleDateString("zh-TW") === today;
        }).length;
        const hotCount = signals.filter(s => s.heat_score >= 3).length;
        if (todayCount === 0 && hotCount === 0) return null;
        return (
          <div className="flex items-center gap-3 mb-3 text-sm" style={{ color: "var(--text-muted)" }}>
            {todayCount > 0 && <span>{t("radar_today_new")} <span className="font-medium" style={{ color: "var(--text-primary)" }}>{todayCount}</span> {t("radar_today_unit")}</span>}
            {hotCount > 0 && (
              <div className="text-orange-500 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{color:"var(--signal-amber)"}}><path d="M12 2c0 0-6 6.67-6 12a6 6 0 0012 0c0-5.33-6-12-6-12zm0 16a4 4 0 01-4-4c0-2.67 2-5.67 4-8 2 2.33 4 5.33 4 8a4 4 0 01-4 4z"/></svg> <span className="font-medium">{hotCount}</span> {t("radar_worth")}
              </div>
            )}
          </div>
        );
      })()}

      <ScrollArea className="flex-1">
        {/* divide-y for semantic row separation */}
        <div className="divide-y divide-gray-100 pr-4" style={{ opacity: listOpacity, transition: "opacity 150ms ease" }}>
          {filtered.map((signal) => {
            const isBookmarked = bookmarks.has(signal.id);
            const highlightCls = heatHighlightClass(signal.heat_score, isBookmarked);
            const lowOpacity = signal.heat_score < 3 ? "opacity-70" : "";

            return (
              <div
                key={signal.id}
                className={`group py-3 px-4 transition-all duration-200 hover:bg-[var(--bg-panel)] cursor-default rounded-sm mx-1 ${highlightCls} ${lowOpacity} ${
                  newIds.has(signal.id)
                    ? "ring-2 ring-blue-200 animate-in fade-in slide-in-from-top-2 bg-blue-50/30"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: source badge + title + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Source badge: text-xs, slightly larger */}
                      {(() => {
                        const { cls, label } = sourceBadgeStyle(signal.source);
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${cls}`}>
                            {label}
                          </span>
                        );
                      })()}
                      <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-blue-500 truncate transition-colors text-sm" style={{ color: "var(--text-primary)" }}
                      >
                        {lang === "zh" && translations[signal.id]
                          ? translations[signal.id].title
                          : signal.title}
                      </a>
                    </div>
                    {/* Description: hide for KOL/alpha_rising; truncate to 100 chars for others */}
                    {signal.source !== "kol_tweet" && signal.source !== "x_kol" && signal.source !== "alpha_rising" && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {(() => {
                          const desc = (lang === "zh" && translations[signal.id]
                            ? translations[signal.id].description
                            : signal.description) || "";
                          return desc.length > 100 ? desc.slice(0, 100) + "..." : desc;
                        })()}
                      </p>
                    )}
                  </div>

                  {/* Right: actions (hover) + timestamp */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Action buttons: visible on hover (or always for bookmarked) */}
                    <div className="flex items-center gap-1">
                      {/* Heat score badge */}
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity ${heatScoreBg(signal.heat_score)}`}
                        title={lang === "zh" ? `熱度 ${signal.heat_score.toFixed(1)}（≥5 熱門 / ≥3 值得關注）` : `Heat ${signal.heat_score.toFixed(1)} (≥5 hot / ≥3 notable)`}
                      >
                        <HeatIcon score={signal.heat_score} /> {signal.heat_score.toFixed(1)}
                      </span>
                      {/* Copy button */}
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          track("signal_copy", { signal_id: String(signal.id), source: signal.source || "" });
                          const text = `${signal.title}\n${signal.url}`;
                          await navigator.clipboard.writeText(text);
                          setCopiedId(signal.id);
                          toast("已複製到剪貼板");
                          setTimeout(() => setCopiedId((prev) => prev === signal.id ? null : prev), 2000);
                        }}
                        className={`text-sm transition-all hover:scale-110 active:scale-95 ${
                          copiedId === signal.id
                            ? "opacity-100 text-green-500"
                            : "text-[var(--border)] hover:text-[var(--text-secondary)] opacity-0 group-hover:opacity-100"
                        }`}
                        title={t("radar_copy")}
                        aria-label={t("radar_copy")}
                      >
                        <IconCopy copied={copiedId === signal.id} />
                      </button>
                      {/* Bookmark button: always visible if bookmarked */}
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          track("signal_bookmark", { signal_id: String(signal.id) });
                          const wasBookmarked = bookmarks.has(signal.id);
                          // Optimistically update UI
                          if (wasBookmarked) {
                            setBookmarks(prev => { const s = new Set(prev); s.delete(signal.id); return s; });
                          } else {
                            setBookmarks(prev => new Set(prev).add(signal.id));
                          }
                          try {
                            const method = wasBookmarked ? "DELETE" : "POST";
                            const res = await fetch(`/api/signals/${signal.id}/bookmark`, { method });
                            if (!res.ok) throw new Error("bookmark failed");
                          } catch (err) {
                            console.error("radar/toggleBookmark:", err);
                            // Revert on error
                            if (wasBookmarked) {
                              setBookmarks(prev => new Set(prev).add(signal.id));
                            } else {
                              setBookmarks(prev => { const s = new Set(prev); s.delete(signal.id); return s; });
                            }
                          }
                        }}
                        className={`text-sm transition-all hover:scale-110 active:scale-95 ${
                          isBookmarked
                            ? "opacity-100 text-amber-500"
                            : "text-[var(--border)] hover:text-[var(--text-secondary)] opacity-0 group-hover:opacity-100"
                        }`}
                        title={isBookmarked ? t("radar_unbookmark") : t("radar_bookmark")}
                        aria-label={isBookmarked ? t("radar_unbookmark") : t("radar_bookmark")}
                        aria-pressed={isBookmarked}
                      >
                        <IconBookmark bookmarked={isBookmarked} />
                      </button>
                      {/* External link */}
                      {signal.url && (
                        <a
                          href={signal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => { e.stopPropagation(); track("signal_original", { signal_id: String(signal.id), source: signal.source || "" }) }}
                          className="text-[var(--border)] hover:text-[var(--text-secondary)] text-xs transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          title={t("radar_view_original")}
                        ><IconExternalLink /></a>
                      )}
                    </div>
                    {/* Timestamp: always visible, right-aligned */}
                    <span className="text-[11px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {relativeTime(signal.created_at, lang)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && signals.length > 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-page-enter">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--bg-panel)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>此分類暫無符合條件的信號</p>
              <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-muted)" }}>{t("radar_empty_cat_desc")}</p>
              <button
                type="button"
                onClick={() => setHeatFilter("all")}
                className="text-sm px-4 py-2 rounded-xl font-medium transition-colors"
                style={{ backgroundColor: "var(--bg-panel)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                查看全部信號
              </button>
            </div>
          )}
          {filtered.length === 0 && signals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-page-enter">
              <FlywheelLogo size={48} className="animate-[spin_8s_linear_infinite] mb-4" style={{ color: "var(--text-muted)" }} />
              <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>{t("radar_empty_all")}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{t("radar_empty_all_desc")}</p>
              <button
                type="button"
                onClick={() => { fetch("/api/scan", { method: "POST" }).catch((err) => console.error("radar/scanTrigger:", err)); }}
                className="text-xs underline mt-4 transition-colors hover:text-[var(--text-secondary)]" style={{ color: "var(--text-muted)" }}
                aria-label={t("radar_manual_scan")}
              >
                {t("radar_manual_scan")}
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function RadarPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full" style={{ backgroundColor: "var(--bg)" }}><span style={{ color: "var(--text-muted)" }}>...</span></div>}>
      <RadarContent />
    </Suspense>
  );
}
