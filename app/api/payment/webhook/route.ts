import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  publicKeyBase64: string
): boolean {
  try {
    // Signing string: timestamp + "\n" + body
    const signingString = `${timestamp}\n${rawBody}`;
    // publicKeyBase64 is HMAC secret (shared key), not RSA public key
    const expected = crypto
      .createHmac("sha256", Buffer.from(publicKeyBase64, "base64"))
      .update(signingString)
      .digest("base64");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rlKey = getRateLimitKey(req);
  const rl = rateLimit(rlKey, { limit: 20, windowSec: 60, prefix: "webhook" });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const webhookPublicKey = process.env.INFINI_WEBHOOK_PUBLIC_KEY;
    if (!webhookPublicKey) {
      console.error("[payment/webhook] Missing INFINI_WEBHOOK_PUBLIC_KEY");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const timestamp = req.headers.get("x-webhook-timestamp") ?? "";
    const signature = req.headers.get("x-webhook-signature") ?? "";

    if (!timestamp || !signature) {
      console.error("[payment/webhook] Missing timestamp or signature");
      return NextResponse.json({ error: "Invalid headers" }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, timestamp, signature, webhookPublicKey);
    if (!isValid) {
      console.error("[payment/webhook] Signature verification failed", { timestamp, sig: signature.substring(0, 20) });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event, status, amount, client_reference } = body;

    if (event === "order.completed" && status === "paid" && client_reference) {
      // client_reference format: userId_timestamp
      const userId = (client_reference as string).replace(/_\d+$/, "");

      // Determine plan and expiry based on amount
      const amountStr = String(amount);
      const isYearly = amountStr === "199";
      const days = isYearly ? 365 : 30;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      const expiresAtStr = expiresAt.toISOString().replace("T", " ").replace(/\..+$/, "");

      const db = getDb();

      // Upsert subscription: set plan=active, update trial_end to new expiry
      const existing = db
        .prepare("SELECT user_id FROM user_subscriptions WHERE user_id = ?")
        .get(userId);

      if (existing) {
        db.prepare(
          "UPDATE user_subscriptions SET plan = 'active', trial_end = ? WHERE user_id = ?"
        ).run(expiresAtStr, userId);
      } else {
        db.prepare(
          "INSERT INTO user_subscriptions (user_id, plan, trial_end) VALUES (?, 'active', ?)"
        ).run(userId, expiresAtStr);
      }

      console.log(`[payment/webhook] Activated ${isYearly ? "yearly" : "monthly"} for ${userId}, expires ${expiresAtStr}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[payment/webhook] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
