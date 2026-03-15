import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ daysLeft: null });

    const db = getDb();
    const sub = db.prepare(
      "SELECT trial_end FROM user_subscriptions WHERE user_id = ?"
    ).get(userId) as { trial_end: string | null } | undefined;

    if (!sub?.trial_end) return NextResponse.json({ daysLeft: null });

    const daysLeft = Math.ceil((new Date(sub.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return NextResponse.json({ daysLeft: Math.max(0, daysLeft) });
  } catch (err) {
    logger.error("user/trial/GET", "Failed to fetch trial info", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ daysLeft: null }, { status: 500 });
  }
}
