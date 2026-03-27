"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  Critical: "bg-red-50 text-red-600",
  High: "bg-orange-50 text-orange-600",
  Medium: "bg-blue-50 text-blue-600",
  Low: "bg-gray-100 text-gray-500",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge variant="outline" className={cn("text-xs font-medium border-0", priorityColors[priority] ?? "bg-gray-100 text-gray-500")}>{priority}</Badge>;
}