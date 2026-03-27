"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  change?: string;
  changeDirection?: "up" | "down";
  accentColor?: string;
};

export function StatCard({ label, value, change, changeDirection, accentColor = "bg-primary" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", accentColor)} />
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
        {change && (
          <p className={cn("mt-1 text-xs", changeDirection === "up" ? "text-emerald-600" : "text-red-600")}>
            {changeDirection === "up" ? "\u2191" : "\u2193"} {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}