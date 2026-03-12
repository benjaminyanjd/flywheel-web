export function FlywheelLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 外圆轨道 */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4"/>
      {/* 飞轮主体：三条弧形叶片 */}
      <path d="M12 2 A10 10 0 0 1 20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <path d="M20 17 A10 10 0 0 1 4 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <path d="M4 17 A10 10 0 0 1 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      {/* 中心点 */}
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  );
}
