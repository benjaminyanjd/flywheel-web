import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const db = getDb();
  interface UserSettings {
    user_id: string;
    categories: string | null;
    scan_interval: number | null;
    notify_channel: string | null;
    email: string | null;
    telegram_chat_id: string | null;
    onboarding_done: number | null;
    user_role: string | null;
    user_focus: string | null;
    opp_type: string | null;
    profit_source: string | null;
    core_skills: string | null;
    opp_horizon: string | null;
    risk_level: string | null;
    time_budget: string | null;
    capital_range: string | null;
    trade_goal: string | null;
  }
  const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as UserSettings | null;

  const hasTelegram = !!settings?.telegram_chat_id;

  return <SettingsClient initialSettings={settings} hasTelegram={hasTelegram} />;
}
