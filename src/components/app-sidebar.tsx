"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, Ticket, BookOpen, Clock, AlertTriangle, FolderTree, Tags, Shield, ScrollText, Bell, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NotificationBell } from "./notification-bell";
import { UserButton } from "@clerk/nextjs";
import { withPreservedDemoQuery } from "@/lib/demo";

const overviewItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tickets", href: "/tickets", icon: Ticket },
  { title: "My Tickets", href: "/my-tickets", icon: Ticket },
];
const supportItems = [
  { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { title: "SLA Dashboard", href: "/sla-dashboard", icon: Clock },
  { title: "Escalations", href: "/escalations", icon: AlertTriangle },
];
const adminItems = [
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Tags", href: "/admin/tags", icon: Tags },
  { title: "SLA Policies", href: "/admin/sla-policies", icon: Shield },
  { title: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useQuery(api.users.getCurrentUser);
  const isStaff = user?.role !== "Requester";
  const isAdmin = user?.role === "Admin";

  const renderGroup = (label: string, items: typeof overviewItems) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                render={<Link href={withPreservedDemoQuery(item.href, searchParams)} />}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href={withPreservedDemoQuery("/dashboard", searchParams)} className="flex items-center gap-2 font-bold text-lg text-primary">
          <Ticket className="h-6 w-6" />
          HelpPilot
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Overview", overviewItems)}
        {isStaff && renderGroup("Support", supportItems)}
        {isAdmin && renderGroup("Admin", adminItems)}
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <UserButton />
          <span className="text-sm font-medium">{user?.name ?? "Loading..."}</span>
        </div>
        <NotificationBell />
      </SidebarFooter>
    </Sidebar>
  );
}
