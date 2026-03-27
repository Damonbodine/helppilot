"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ type = "table" }: { type?: "table" | "cards" | "detail" }) {
  if (type === "cards") return (
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
    </div>
  );
  if (type === "detail") return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}
    </div>
  );
}