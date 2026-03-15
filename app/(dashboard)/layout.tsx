import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { TrialBanner } from "@/components/trial-banner";

export async function generateMetadata() {
  const db = getDb();
  const newOpps = (db.prepare(
    `SELECT COUNT(*) as c FROM opportunity_actions WHERE action = 'missed' AND created_at > datetime('now', '-24 hours')`
  ).get() as { c: number } | undefined)?.c ?? 0;
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
  interface UserSub { plan: string; trial_end: string | null | undefined }
  const db = getDb();
  const sub = db.prepare("SELECT * FROM user_subscriptions WHERE user_id = ?").get(userId) as UserSub | undefined;

  // No subscription = must complete onboarding (which requires invite code)
  if (!sub) {
    redirect("/onboarding");
  } else if (sub.plan === "pending") {
    redirect("/onboarding");
  } else if (sub.plan === "trial" && sub.trial_end && new Date(sub.trial_end) < new Date()) {
    redirect("/expired");
  } else if (sub.plan === "expired") {
    redirect("/expired");
  }

  const daysLeft = sub?.plan === "trial" && sub?.trial_end
    ? Math.ceil((new Date(sub.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {daysLeft !== null && daysLeft <= 7 && (
            <TrialBanner daysLeft={daysLeft} />
          )}
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  );
}
