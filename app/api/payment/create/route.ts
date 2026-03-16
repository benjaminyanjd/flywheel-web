import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOrder } from "@/lib/infini";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://flywheelsea.club";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rlKey = getRateLimitKey(req, userId);
  const rl = rateLimit(rlKey, { limit: 10, windowSec: 3600, prefix: "payment" });
  if (!rl.success) {
    return NextResponse.json(
      { error: "請求過於頻繁，請稍後再試" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = await req.json();
  const plan: "monthly" | "yearly" = body.plan === "yearly" ? "yearly" : "monthly";
  const amount = plan === "yearly" ? "199" : "19.9";

  try {
    console.log('[payment/create] KEY_ID:', process.env.INFINI_KEY_ID?.substring(0,8), 'SECRET:', process.env.INFINI_SECRET_KEY?.substring(0,5));
    const order = await createOrder({
      request_id: crypto.randomUUID(),
      amount,
      currency: "USD",
      client_reference: `${userId}_${Date.now()}`,
      success_url: `${APP_URL}/payment/success`,
      failure_url: `${APP_URL}/expired`,
      description: `嗅鐘 Sniffing Clock ${plan} subscription`,
    });

    return NextResponse.json({ checkout_url: order.checkout_url, order_id: order.order_id });
  } catch (err) {
    console.error("[payment/create] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create order" },
      { status: 500 }
    );
  }
}
