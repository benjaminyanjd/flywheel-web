import React from "react";

export function FlywheelLogo({
  size = 24,
  className = "",
  style,
  animated = true,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
}) {
  const id = React.useId().replace(/:/g, "");

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
      {animated && (
        <style>{`
          @keyframes ${id}_sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes ${id}_hand  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes ${id}_blip1 { 0%,100%{ opacity:0.9; r:2.5; } 50%{ opacity:0.2; r:1.5; } }
          @keyframes ${id}_blip2 { 0%,100%{ opacity:0.55; r:2; } 50%{ opacity:0.1; r:1; } }
          .${id}_sweep { transform-origin: 30px 30px; animation: ${id}_sweep 8s linear infinite; }
          .${id}_hand  { transform-origin: 30px 30px; animation: ${id}_hand 10s linear infinite; }
          .${id}_blip1 { transform-origin: 44px 16px; animation: ${id}_blip1 2.4s ease-in-out infinite; }
          .${id}_blip2 { transform-origin: 22px 14px; animation: ${id}_blip2 2.4s ease-in-out 0.8s infinite; }
        `}</style>
      )}

      {/* Outer circle */}
      <circle cx="30" cy="30" r="27" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Inner circle */}
      <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>

      {/* Radar sweep — rotates with hand */}
      <g className={animated ? `${id}_sweep` : ""}>
        <path d="M30 30 L30 3 A27 27 0 0 1 48 12 Z" fill="currentColor" opacity="0.12"/>
        <path d="M30 30 L30 3 A27 27 0 0 1 38 6 Z" fill="currentColor" opacity="0.22"/>
      </g>

      {/* Clock ticks */}
      <line x1="30" y1="3"  x2="30" y2="7"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="57" y1="30" x2="53" y2="30" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" opacity="0.6"/>
      <line x1="30" y1="57" x2="30" y2="53" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" opacity="0.6"/>
      <line x1="3"  y1="30" x2="7"  y2="30" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" opacity="0.6"/>

      {/* Minute hand — rotates */}
      <g className={animated ? `${id}_hand` : ""}>
        <line x1="30" y1="30" x2="30" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* Hour hand — static (points to ~2 o'clock) */}
      <line x1="30" y1="30" x2="44" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>

      {/* Signal blips */}
      <circle cx="44" cy="16" r="2.5" fill="currentColor" className={animated ? `${id}_blip1` : ""} opacity="0.9"/>
      <circle cx="22" cy="14" r="2"   fill="currentColor" className={animated ? `${id}_blip2` : ""} opacity="0.55"/>

      {/* Center dot */}
      <circle cx="30" cy="30" r="2.5" fill="currentColor"/>
    </svg>
  );
}
