import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { amount, note } = await req.json();
  const db = getDb();

  db.prepare(`
    UPDATE opportunity_actions
    SET outcome_amount = ?, outcome_note = ?, outcome_at = CURRENT_TIMESTAMP
    WHERE id = ? AND (user_id = ? OR user_id = 'system')
  `).run(amount ?? null, note ?? null, id, userId);

  return NextResponse.json({ ok: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  const row = db.prepare(
    "SELECT outcome_amount, outcome_note, outcome_at FROM opportunity_actions WHERE id = ?"
  ).get(id) as Record<string, unknown> | undefined;

  return NextResponse.json(row ?? {});
}
