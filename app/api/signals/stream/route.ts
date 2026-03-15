import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  // Shared state accessible by both start() and cancel()
  let closed = false;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      let lastSeen = new Date().toISOString();

      // Safe enqueue: silently ignore if controller is already closed
      const safeEnqueue = (data: Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(data);
        } catch {
          closed = true;
          if (intervalId) clearInterval(intervalId);
        }
      };

      intervalId = setInterval(() => {
        if (closed) {
          if (intervalId) clearInterval(intervalId);
          return;
        }

        try {
          const db = getDb();
          const newSignals = db
            .prepare("SELECT * FROM signals WHERE created_at > ? ORDER BY created_at ASC")
            .all(lastSeen);

          if (newSignals.length > 0) {
            const latest = newSignals[newSignals.length - 1] as { created_at: string };
            lastSeen = latest.created_at;
            safeEnqueue(encoder.encode(`data: ${JSON.stringify(newSignals)}\n\n`));
          } else {
            // Heartbeat to keep connection alive
            safeEnqueue(encoder.encode(": heartbeat\n\n"));
          }
        } catch (err) {
          logger.error("signals/stream", "SSE poll error", { error: err instanceof Error ? err.message : String(err) });
          closed = true;
          if (intervalId) clearInterval(intervalId);
          try { controller.close(); } catch { /* already closed */ }
        }
      }, 5000);

      // Send initial connection event
      safeEnqueue(encoder.encode("data: {\"connected\":true}\n\n"));
    },
    cancel() {
      // Client disconnected — stop polling
      closed = true;
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
