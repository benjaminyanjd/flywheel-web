import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/toast";

export async function generateMetadata() {
  const db = getDb();
  const newOpps = (db.prepare(
    `SELECT COUNT(*) as c FROM opportunity_actions WHERE action = 'missed' AND created_at > datetime('now', '-24 hours')`
  ).get() as any)?.c ?? 0;
  return {
    title: newOpps > 0 ? `(${newOpps}) Flywheel` : "Flywheel",
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check subscription status
  const db = getDb();
  const sub = db.prepare("SELECT * FROM user_subscriptions WHERE user_id = ?").get(userId) as any;

  if (!sub) {
    const settings = db.prepare("SELECT onboarding_done FROM user_settings WHERE user_id = ?").get(userId) as any;
    if (!settings?.onboarding_done) redirect("/onboarding");
  } else if (sub.plan === "pending") {
    redirect("/onboarding");
  } else if (sub.plan === "trial" && new Date(sub.trial_end) < new Date()) {
    redirect("/expired");
  } else if (sub.plan === "expired") {
    redirect("/expired");
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
      </div>
    </ToastProvider>
  );
}
