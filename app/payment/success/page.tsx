"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { SuccessIcon } from "@/components/icons";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Wait 5s for webhook to process, then redirect
    const timer = setTimeout(() => {
      router.push("/opportunities");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <TopNav hideCta />
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <FlywheelLogo size={52} className="text-green-500 animate-[spin_4s_linear_infinite]" />
        </div>
        <div className="flex justify-center mb-3">
          <SuccessIcon size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>支付成功</h1>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>正在激活帳戶，請稍候...</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>5 秒後自動跳轉到應用</p>
      </div>
      </div>
    </div>
  );
}
