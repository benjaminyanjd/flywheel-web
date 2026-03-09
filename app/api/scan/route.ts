import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST() {
  const script = process.env["FLYWHEEL_SCAN_SCRIPT"];
  if (!script) return NextResponse.json({ status: "error", message: "FLYWHEEL_SCAN_SCRIPT not configured" }, { status: 500 });
  const child = spawn("node", [script], { detached: true, stdio: "ignore" });
  child.unref();
  return NextResponse.json({ status: "started", message: "扫描已启动，新信号将通过雷达频道实时显示" });
}
