/**
 * Structured logger for Flywheel API routes.
 * Outputs JSON lines to stdout/stderr for easy parsing.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  route: string;
  message: string;
  userId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

function write(level: LogLevel, route: string, message: string, extra?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    route,
    message,
    ...extra,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (route: string, message: string, extra?: Record<string, unknown>) =>
    write("info", route, message, extra),

  warn: (route: string, message: string, extra?: Record<string, unknown>) =>
    write("warn", route, message, extra),

  error: (route: string, message: string, extra?: Record<string, unknown>) =>
    write("error", route, message, extra),
};

/**
 * Helper to time an async operation and log result.
 * Usage:
 *   const result = await withTiming("signals/GET", () => db.prepare(...).all());
 */
export async function withTiming<T>(
  route: string,
  label: string,
  fn: () => T | Promise<T>,
  userId?: string
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    logger.info(route, label, { durationMs, userId });
    return result;
  } catch (err) {
    const durationMs = Date.now() - start;
    logger.error(route, `${label} failed`, {
      durationMs,
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
