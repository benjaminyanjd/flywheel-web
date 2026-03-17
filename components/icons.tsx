import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================
// Suite A — UI Navigation Icons (24x24 viewBox)
// ============================================================

export function RadarIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="12" x2="18" y2="6" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function OpportunityIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12,6 12,12 16,10" />
      <polyline points="11,12 14,15 18,9" />
    </svg>
  );
}

export function ArchiveIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M4 7V5a1 1 0 011-1h14a1 1 0 011 1v2" />
      <rect x="3" y="7" width="18" height="4" rx="1" />
      <path d="M5 11v7a1 1 0 001 1h12a1 1 0 001-1v-7" />
      <circle cx="15" cy="15" r="2.5" />
      <polyline points="15,13.8 15,15 16,15.6" />
    </svg>
  );
}

export function AdvisorIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M4 12a8 8 0 018-8 8 8 0 018 8c0 3-1.5 5-4 6.5L14 21H10l-2-2.5C5.5 17 4 15 4 12z" />
      <path d="M16.5 8.5a3 3 0 00-2-1" />
      <path d="M9 17c1.5-1 2-2 2-3.5" />
      <path d="M19 6.5c.8.5 1.3 1 1.5 1.5" />
      <path d="M20 10c.3.5.4 1 .3 1.5" />
    </svg>
  );
}

export function TodoListIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <polyline points="7,8 8.5,9.5 11,7" />
      <line x1="13" y1="8" x2="18" y2="8" />
      <rect x="7" y="11.5" width="4" height="3" rx="0.5" />
      <line x1="13" y1="13" x2="18" y2="13" />
      <line x1="7" y1="18" x2="11" y2="18" />
      <line x1="13" y1="18" x2="17" y2="18" />
    </svg>
  );
}

export function SettingsIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 2l1.5 3.2a7 7 0 012.3 1.3L19 5.5l.5 3.2a7 7 0 01.8 2.5l3 1.3-1.5 2.8a7 7 0 01-.3 2.7l1.5 2.8-2.7 1.5a7 7 0 01-2 1.8L17.5 22l-2.8-1.5a7 7 0 01-2.7.3L9.2 22l-1.5-2.8a7 7 0 01-2.2-1.2L2.5 19l-.3-3.2a7 7 0 01-1-2.3L2 10l3-1.5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="6" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SignalIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <path d="M5 14.5a6.5 6.5 0 016.5 6.5" />
      <path d="M5 10a11 11 0 0111 11" />
      <path d="M5 5.5A15.5 15.5 0 0120.5 21" />
      <line x1="14" y1="3" x2="14" y2="6" />
      <line x1="12.5" y1="4.5" x2="15.5" y2="4.5" />
    </svg>
  );
}

export function PushIcon({ size = 24, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="9" cy="12" r="7" />
      <polyline points="9,8.5 9,12 11.5,13.5" />
      <line x1="16" y1="9" x2="21" y2="9" />
      <polyline points="19,7 21,9 19,11" />
      <line x1="16" y1="15" x2="21" y2="15" />
      <polyline points="19,13 21,15 19,17" />
    </svg>
  );
}

// ============================================================
// Suite B — Brand Illustration Icons (48x48 viewBox)
// ============================================================

export function ScanIcon({ size = 48, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="24" cy="24" r="18" opacity="0.3" />
      <circle cx="24" cy="24" r="13" opacity="0.4" />
      <circle cx="24" cy="24" r="8" opacity="0.6" />
      <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      <line x1="24" y1="24" x2="38" y2="12" opacity="0.8" />
      <circle cx="34" cy="18" r="1.5" fill="#FF6B35" stroke="none" />
      <circle cx="30" cy="30" r="1.2" fill="#FF6B35" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="#3CB371" stroke="none" />
    </svg>
  );
}

export function FilterIcon({ size = 48, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="8" r="1" fill="#3CB371" stroke="none" opacity="0.5" />
      <circle cx="18" cy="6" r="0.8" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="24" cy="7" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      <circle cx="30" cy="5" r="0.7" fill="currentColor" stroke="none" opacity="0.3" />
      <circle cx="36" cy="8" r="0.9" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none" opacity="0.3" />
      <circle cx="33" cy="10" r="0.8" fill="currentColor" stroke="none" opacity="0.4" />
      <path d="M8 14h32l-10 14v8l-4 4v-12L8 14z" opacity="0.8" />
      <line x1="8" y1="14" x2="40" y2="14" strokeWidth="2" />
      <circle cx="20" cy="44" r="2" fill="#3CB371" stroke="none" />
      <circle cx="26" cy="44" r="2" fill="#FF6B35" stroke="none" />
      <circle cx="32" cy="44" r="2" fill="#3CB371" stroke="none" />
    </svg>
  );
}

export function MatchIcon({ size = 48, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="24" cy="24" r="18" opacity="0.3" />
      <circle cx="24" cy="24" r="12" opacity="0.5" />
      <circle cx="24" cy="24" r="6" />
      <line x1="24" y1="2" x2="24" y2="10" />
      <line x1="24" y1="38" x2="24" y2="46" />
      <line x1="2" y1="24" x2="10" y2="24" />
      <line x1="38" y1="24" x2="46" y2="24" />
      <circle cx="24" cy="24" r="2.5" fill="#FF6B35" stroke="none" />
      <line x1="18" y1="18" x2="15" y2="15" />
      <line x1="30" y1="18" x2="33" y2="15" />
      <line x1="18" y1="30" x2="15" y2="33" />
      <line x1="30" y1="30" x2="33" y2="33" />
    </svg>
  );
}

export function BrandPushIcon({ size = 48, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="18" cy="24" r="12" />
      <polyline points="18,16 18,24 24,27" />
      <line x1="18" y1="12.5" x2="18" y2="14" />
      <line x1="18" y1="34" x2="18" y2="35.5" />
      <line x1="6.5" y1="24" x2="8" y2="24" />
      <line x1="28" y1="24" x2="29.5" y2="24" />
      <path d="M32 20c2-1 4-1 6 0" opacity="0.8" />
      <path d="M33 24c2 0 4 0 6 0" />
      <path d="M32 28c2 1 4 1 6 0" opacity="0.8" />
      <polyline points="36,18 38,20 36,22" opacity="0.6" />
      <polyline points="37,22 39,24 37,26" opacity="0.6" />
      <polyline points="36,26 38,28 36,30" opacity="0.6" />
    </svg>
  );
}

export function EmptyIcon({ size = 48, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <line x1="10" y1="40" x2="20" y2="28" />
      <line x1="26" y1="40" x2="20" y2="28" />
      <line x1="18" y1="34" x2="22" y2="34" />
      <rect x="18" y="18" width="16" height="10" rx="5" transform="rotate(-30 26 23)" />
      <ellipse cx="36" cy="16" rx="4" ry="5.5" transform="rotate(-30 36 16)" />
      <path d="M40 8c1-2 4-3 5-1s-1 3-2 4l-1 1" opacity="0.6" />
      <circle cx="42" cy="14.5" r="0.7" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  );
}

export function LanguageIcon({
  size = 20,
  isActive = false,
  className = "",
  style
}: IconProps & { isActive?: boolean }) {
  const color = isActive ? "var(--signal)" : "var(--text-muted)";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="1.5" strokeLinecap="round"
         className={className} style={style}>
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill={color}>
        ZH
      </text>
    </svg>
  );
}

export function ThemeIcon({
  size = 20,
  isDark = false,
  className = "",
  style
}: IconProps & { isDark?: boolean }) {
  const color = "var(--signal)";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="1.5" strokeLinecap="round"
         className={className}
         style={{...style, animation: "rotate 0.3s ease-in-out"}}
    >
      {isDark ? (
        // Moon with signal point
        <>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          <circle cx="17" cy="7" r="1.5" fill={color} opacity="0.8"/>
        </>
      ) : (
        // Sun with signal point
        <>
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <circle cx="19" cy="5" r="1.2" fill={color} opacity="0.6"/>
        </>
      )}
    </svg>
  );
}

// ============================================================
// Suite C — Category Icons (14x14 viewBox, reusable)
// ============================================================

export function IconAITech({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
      <path d="M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M16.24 7.76l2.12-2.12M5.64 18.36l2.12-2.12"/>
    </svg>
  );
}

export function IconCrypto({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  );
}

export function IconNewTools({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0z"/>
      <path d="M6 2v4M2 6h4"/>
      <path d="M13 17l-9 4 4-9 5 5z"/>
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export function IconOnchain({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="1" y="5" width="6" height="6" rx="1"/>
      <rect x="9" y="13" width="6" height="6" rx="1"/>
      <rect x="17" y="5" width="6" height="6" rx="1"/>
      <path d="M7 8h10M15 8l-6 8"/>
    </svg>
  );
}

export function IconCommunity({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      <path d="M8 9h8M8 13h4"/>
    </svg>
  );
}

export function IconOverseas({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 3a14.5 14.5 0 010 18M3 12h18"/>
      <path d="M3 7.5h18M3 16.5h18"/>
    </svg>
  );
}

export function IconKOL({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

export function IconAlpha({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}

export function HotIcon({ size = 16, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 2c0 0-6 6.67-6 12a6 6 0 0012 0c0-5.33-6-12-6-12zm0 16a4 4 0 01-4-4c0-2.67 2-5.67 4-8 2 2.33 4 5.33 4 8a4 4 0 01-4 4z"/>
    </svg>
  );
}

export function FeedbackIcon({ size = 20, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

export function ClockIcon({ size = 20, className = "", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

export function SuccessIcon({ size = 48, className = "", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="24" cy="24" r="18" opacity="0.25" />
      <circle cx="24" cy="24" r="13" opacity="0.4" />
      <circle cx="24" cy="24" r="8" opacity="0.6" />
      <circle cx="24" cy="24" r="3" fill="#FF6B35" stroke="none" />
      <line x1="36" y1="10" x2="25" y2="22" strokeWidth="2" />
      <polyline points="36,10 36,14 32,10" fill="none" />
      <line x1="14" y1="10" x2="14" y2="6" />
      <line x1="12" y1="8" x2="16" y2="8" />
      <line x1="38" y1="30" x2="38" y2="26" />
      <line x1="36" y1="28" x2="40" y2="28" />
      <line x1="10" y1="36" x2="10" y2="32" />
      <line x1="8" y1="34" x2="12" y2="34" />
      <circle cx="34" cy="38" r="1" fill="#3CB371" stroke="none" />
      <circle cx="8" cy="18" r="0.8" fill="#3CB371" stroke="none" />
    </svg>
  );
}
