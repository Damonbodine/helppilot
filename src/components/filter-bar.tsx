"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type FilterBarProps = {
  statusFilter: string;
  priorityFilter: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onClear: () => void;
};

export function FilterBar({ statusFilter, priorityFilter, onStatusChange, onPriorityChange, onClear }: FilterBarProps) {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v ?? "all")}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Open">Open</SelectItem>
          <SelectItem value="Triaged">Triaged</SelectItem>
          <SelectItem value="InProgress">In Progress</SelectItem>
          <SelectItem value="OnHold">On Hold</SelectItem>
          <SelectItem value="Resolved">Resolved</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={priorityFilter} onValueChange={(v) => onPriorityChange(v ?? "all")}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Priorities" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="Critical">Critical</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>
      {(statusFilter !== "all" || priorityFilter !== "all") && (
        <Button variant="ghost" size="sm" onClick={onClear}><X className="h-4 w-4 mr-1" /> Clear</Button>
      )}
    </div>
  );
}