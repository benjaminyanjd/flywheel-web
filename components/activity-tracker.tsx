"use client";

import { useEffect } from "react";

export function ActivityTracker() {
  useEffect(() => {
    // Record user activity on page load (fire-and-forget)
    fetch("/api/user/activity", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
