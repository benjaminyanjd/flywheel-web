import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const { stdout, stderr } = await execAsync(
      `cd ~/Projects/flywheel-bot && timeout 120 node -e "const o = require('./modules/opportunity'); o.manualIdentify().then(() => process.exit(0))"`,
      { timeout: 130_000 }
    );

    return NextResponse.json({
      status: "success",
      output: stdout,
      errors: stderr || undefined,
    });
  } catch (err) {
    const error = err as { stdout?: string; stderr?: string; message?: string };
    console.error("Opportunity identification failed:", err);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Opportunity identification failed",
        output: error.stdout || undefined,
        errors: error.stderr || undefined,
      },
      { status: 500 }
    );
  }
}
