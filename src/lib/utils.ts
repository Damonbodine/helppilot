import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Status color mapping
export const statusColors: Record<string, string> = {
  Open: "bg-blue-50 text-blue-600",
  Triaged: "bg-purple-50 text-purple-600",
  InProgress: "bg-indigo-50 text-indigo-600",
  OnHold: "bg-amber-50 text-amber-600",
  Resolved: "bg-emerald-50 text-emerald-600",
  Closed: "bg-gray-100 text-gray-500",
};

// Priority color mapping
export const priorityColors: Record<string, string> = {
  Critical: "bg-red-50 text-red-600 border-l-4 border-l-red-500",
  High: "bg-orange-50 text-orange-600 border-l-4 border-l-orange-500",
  Medium: "bg-blue-50 text-blue-600 border-l-4 border-l-blue-500",
  Low: "bg-gray-50 text-gray-500 border-l-4 border-l-gray-300",
};

// Priority badge styles (without border)
export const priorityBadgeColors: Record<string, string> = {
  Critical: "bg-red-50 text-red-600",
  High: "bg-orange-50 text-orange-600",
  Medium: "bg-blue-50 text-blue-600",
  Low: "bg-gray-100 text-gray-500",
};

// SLA status helpers
export function getSlaStatus(deadline: number | undefined): "on-track" | "at-risk" | "breached" | "none" {
  if (!deadline) return "none";
  const now = Date.now();
  if (now > deadline) return "breached";
  const remaining = deadline - now;
  const total = deadline - (deadline - remaining);
  if (remaining < total * 0.25) return "at-risk";
  return "on-track";
}

export const slaStatusColors: Record<string, string> = {
  "on-track": "text-emerald-600",
  "at-risk": "text-amber-600",
  "breached": "text-red-600",
  "none": "text-gray-400",
};

export function formatTimeRemaining(deadline: number | undefined): string {
  if (!deadline) return "N/A";
  const diff = deadline - Date.now();
  if (diff <= 0) return "Overdue";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}