"use client";


import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const user = useQuery(api.users.getCurrentUser);
  const notifications = useQuery(api.notifications.listMine, user === undefined ? "skip" : {});
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const router = useRouter();

  if (notifications === undefined) return <LoadingSkeleton type="table" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.isRead) && <Button variant="outline" size="sm" onClick={() => markAllRead({})}><CheckCheck className="h-4 w-4 mr-1" />Mark All Read</Button>}
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n._id} className={cn("cursor-pointer hover:shadow-sm transition-shadow", !n.isRead && "border-l-4 border-l-primary")} onClick={async () => { if (!n.isRead) await markRead({ notificationId: n._id }); if (n.link) router.push(n.link); }}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1">
                  <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{n.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
