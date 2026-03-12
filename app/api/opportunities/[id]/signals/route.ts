import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const opp = db.prepare("SELECT signal_ids FROM opportunity_actions WHERE id = ?").get(id) as any;
  if (!opp?.signal_ids) return NextResponse.json({ signals: [] });

  // Handle both JSON array format "[4,14]" and comma-separated "4,14"
  let ids: string[];
  try {
    const parsed = JSON.parse(opp.signal_ids);
    ids = Array.isArray(parsed) ? parsed.map(String) : opp.signal_ids.split(",").map((s: string) => s.trim());
  } catch {
    ids = opp.signal_ids.split(",").map((s: string) => s.trim());
  }
  ids = ids.filter(Boolean);
  if (ids.length === 0) return NextResponse.json({ signals: [] });

  const placeholders = ids.map(() => "?").join(",");
  const signals = db.prepare(
    `SELECT id, source, title, url, heat_score FROM signals WHERE id IN (${placeholders})`
  ).all(...ids);

  return NextResponse.json({ signals });
}
