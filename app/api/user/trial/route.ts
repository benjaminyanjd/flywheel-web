import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ daysLeft: null });

  const db = getDb();
  const sub = db.prepare(
    "SELECT trial_end FROM user_subscriptions WHERE user_id = ?"
  ).get(userId) as any;

  if (!sub?.trial_end) return NextResponse.json({ daysLeft: null });

  const daysLeft = Math.ceil((new Date(sub.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return NextResponse.json({ daysLeft: Math.max(0, daysLeft) });
}
