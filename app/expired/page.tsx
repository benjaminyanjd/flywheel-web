import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ExpiredContent } from "@/components/expired-content";

export default async function ExpiredPage() {
  const { userId } = await auth();
  const db = getDb();

  // 取用戶統計與試用狀態
  let totalOpps = 0;
  let actionedOpps = 0;
  let isActuallyExpired = true;
  let daysLeft = 0;

  if (userId) {
    const sub = db.prepare("SELECT created_at, plan, trial_end FROM user_subscriptions WHERE user_id = ?").get(userId) as { created_at: string; plan: string; trial_end: string | null } | undefined;

    // Already active — redirect to app
    if (sub?.plan === "active") {
      redirect("/opportunities");
    }
    // 只統計該用戶自己的機會（不含系統全局）
    totalOpps = (db.prepare("SELECT COUNT(*) as c FROM opportunity_actions WHERE user_id = ?").get(userId) as { c: number } | undefined)?.c ?? 0;
    actionedOpps = (db.prepare("SELECT COUNT(*) as c FROM opportunity_actions WHERE action IN ('action','done') AND user_id = ?").get(userId) as { c: number } | undefined)?.c ?? 0;
    // 判斷是否真的過期
    if (sub?.plan === "trial" && sub?.trial_end) {
      const msLeft = new Date(sub.trial_end).getTime() - Date.now();
      isActuallyExpired = msLeft <= 0;
      daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    } else if (sub?.plan !== "expired") {
      isActuallyExpired = false;
    }
  }

  return (
    <ExpiredContent
      isActuallyExpired={isActuallyExpired}
      daysLeft={daysLeft}
      totalOpps={totalOpps}
      actionedOpps={actionedOpps}
    />
  );
}
