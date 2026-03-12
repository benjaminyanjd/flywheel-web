import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { spawn } from "child_process";

const COOLDOWN_SECONDS = 30 * 60; // 30 minutes

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Check cooldown
    const settings = db
      .prepare(`SELECT last_scan_at FROM user_settings WHERE user_id = ?`)
      .get(userId) as { last_scan_at: string | null } | undefined;

    if (settings?.last_scan_at) {
      const lastScan = new Date(settings.last_scan_at + "Z").getTime();
      const elapsed = (Date.now() - lastScan) / 1000;
      if (elapsed < COOLDOWN_SECONDS) {
        const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
        return NextResponse.json({ error: "冷卻中", cooldown: remaining }, { status: 429 });
      }
    }

    const script = process.env["FLYWHEEL_SCAN_SCRIPT"];
    if (!script) {
      return NextResponse.json({ status: "error", message: "FLYWHEEL_SCAN_SCRIPT not configured" }, { status: 500 });
    }

    const child = spawn("node", [script], { detached: true, stdio: "ignore" });
    child.unref();

    // Update last_scan_at
    db.prepare(
      `INSERT INTO user_settings (user_id, last_scan_at) VALUES (?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET last_scan_at = datetime('now')`
    ).run(userId);

    return NextResponse.json({ status: "started", message: "扫描已启动，新信号将通过雷达频道实时显示" });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
