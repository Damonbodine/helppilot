"use client";

import { cn } from "@/lib/utils";

export function SlaCountdown({ deadline }: { deadline?: number }) {
  if (!deadline) return <span className="text-xs text-muted-foreground">N/A</span>;
  const diff = deadline - Date.now();
  if (diff <= 0) return <span className="text-xs font-medium text-red-600">Overdue</span>;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const total = deadline - (deadline - diff);
  const pct = diff / total;
  const color = pct < 0.25 ? "text-amber-600" : "text-emerald-600";
  return <span className={cn("text-xs font-medium", color)}>{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</span>;
}