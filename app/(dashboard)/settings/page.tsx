import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const db = getDb();
  const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as any;

  return <SettingsClient initialSettings={settings} />;
}
