"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Open: "bg-blue-50 text-blue-600",
  Triaged: "bg-purple-50 text-purple-600",
  InProgress: "bg-indigo-50 text-indigo-600",
  OnHold: "bg-amber-50 text-amber-600",
  Resolved: "bg-emerald-50 text-emerald-600",
  Closed: "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={cn("text-xs font-medium border-0", statusColors[status] ?? "bg-gray-100 text-gray-500")}>{status}</Badge>;
}