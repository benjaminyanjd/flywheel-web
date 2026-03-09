import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let lastSeen = new Date().toISOString();
      let closed = false;

      const interval = setInterval(() => {
        if (closed) return;

        try {
          const db = getDb();
          const newSignals = db
            .prepare("SELECT * FROM signals WHERE created_at > ? ORDER BY created_at ASC")
            .all(lastSeen);

          if (newSignals.length > 0) {
            const latest = newSignals[newSignals.length - 1] as { created_at: string };
            lastSeen = latest.created_at;

            const data = `data: ${JSON.stringify(newSignals)}\n\n`;
            controller.enqueue(encoder.encode(data));
          } else {
            // Send heartbeat to keep connection alive
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          }
        } catch (err) {
          console.error("SSE poll error:", err);
          clearInterval(interval);
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
      }, 5000);

      // Send initial connection event
      controller.enqueue(encoder.encode("data: {\"connected\":true}\n\n"));

      // Cleanup when the stream is cancelled
      const cleanup = () => {
        closed = true;
        clearInterval(interval);
      };

      // Handle abort
      controller.enqueue(encoder.encode(""));
      (controller as unknown as { signal?: AbortSignal }).signal?.addEventListener("abort", cleanup);
    },
    cancel() {
      // Stream cancelled by client
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
