import React from "react";

export function FlywheelLogo({
  size = 24,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="30" cy="30" r="27" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Inner circle */}
      <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
      {/* Radar sweep sector */}
      <path d="M30 30 L30 3 A27 27 0 0 1 48 12 Z" fill="currentColor" opacity="0.15"/>
      <path d="M30 30 L30 3 A27 27 0 0 1 38 6 Z" fill="currentColor" opacity="0.25"/>
      {/* Clock tick top */}
      <line x1="30" y1="3" x2="30" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Clock ticks 3/6/9 */}
      <line x1="57" y1="30" x2="53" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="30" y1="57" x2="30" y2="53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="3" y1="30" x2="7" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      {/* Clock hands */}
      <line x1="30" y1="30" x2="30" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="30" y1="30" x2="44" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      {/* Signal blips */}
      <circle cx="44" cy="16" r="2.5" fill="currentColor" opacity="0.9"/>
      <circle cx="22" cy="14" r="2" fill="currentColor" opacity="0.55"/>
      {/* Center */}
      <circle cx="30" cy="30" r="2.5" fill="currentColor"/>
    </svg>
  );
}
