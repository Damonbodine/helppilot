"use client";


import { useState } from "react";
import { TicketsTable } from "@/components/tickets-table";
import { FilterBar } from "@/components/filter-bar";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { withPreservedDemoQuery } from "@/lib/demo";

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const searchParams = useSearchParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage all support tickets</p>
        </div>
        <Link href={withPreservedDemoQuery("/tickets/new", searchParams)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80"><Plus className="h-4 w-4 mr-2" />New Ticket</Link>
      </div>
      <FilterBar
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onClear={() => { setStatusFilter("all"); setPriorityFilter("all"); }}
      />
      <TicketsTable
        status={statusFilter !== "all" ? statusFilter as any : undefined}
      />
    </div>
  );
}
