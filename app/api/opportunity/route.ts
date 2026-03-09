import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST() {
  const script = process.env["FLYWHEEL_OPP_SCRIPT"];
  if (!script) return NextResponse.json({ status: "error", message: "FLYWHEEL_OPP_SCRIPT not configured" }, { status: 500 });
  const child = spawn("node", [script], { detached: true, stdio: "ignore" });
  child.unref();
  return NextResponse.json({ status: "started", message: "机会识别已启动，完成后刷新机会页面查看结果" });
}
