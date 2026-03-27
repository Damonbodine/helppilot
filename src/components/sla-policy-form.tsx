"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

type SLAPolicyFormProps = {
  initialData?: {
    _id: Id<"slaPolicies">;
    name: string;
    priority: string;
    responseTimeHours: number;
    resolutionTimeHours: number;
    escalateAfterResponseHours?: number;
    escalateAfterResolutionHours?: number;
    escalateToRole?: string;
    isDefault: boolean;
    isActive: boolean;
  };
};

export function SLAPolicyForm({ initialData }: SLAPolicyFormProps) {
  const router = useRouter();
  const createPolicy = useMutation(api.slaPolicies.create);
  const updatePolicy = useMutation(api.slaPolicies.update);

  const [name, setName] = useState(initialData?.name ?? "");
  const [priority, setPriority] = useState(initialData?.priority ?? "Medium");
  const [responseTimeHours, setResponseTimeHours] = useState(initialData?.responseTimeHours ?? 8);
  const [resolutionTimeHours, setResolutionTimeHours] = useState(initialData?.resolutionTimeHours ?? 24);
  const [escalateAfterResponseHours, setEscalateAfterResponseHours] = useState(initialData?.escalateAfterResponseHours ?? 0);
  const [escalateAfterResolutionHours, setEscalateAfterResolutionHours] = useState(initialData?.escalateAfterResolutionHours ?? 0);
  const [escalateToRole, setEscalateToRole] = useState(initialData?.escalateToRole ?? "");
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updatePolicy({
          policyId: initialData._id,
          name,
          priority: priority as "Critical" | "High" | "Medium" | "Low",
          responseTimeHours,
          resolutionTimeHours,
          escalateAfterResponseHours: escalateAfterResponseHours || undefined,
          escalateAfterResolutionHours: escalateAfterResolutionHours || undefined,
          escalateToRole: escalateToRole ? escalateToRole as "TeamLead" | "Admin" : undefined,
          isDefault,
          isActive,
        });
      } else {
        await createPolicy({
          name,
          priority: priority as "Critical" | "High" | "Medium" | "Low",
          responseTimeHours,
          resolutionTimeHours,
          escalateAfterResponseHours: escalateAfterResponseHours || undefined,
          escalateAfterResolutionHours: escalateAfterResolutionHours || undefined,
          escalateToRole: escalateToRole ? escalateToRole as "TeamLead" | "Admin" : undefined,
          isDefault,
          isActive,
        });
      }
      router.push("/admin/sla-policies");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Policy Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v ?? "")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Response Time (hours)</Label>
          <Input type="number" value={responseTimeHours} onChange={(e) => setResponseTimeHours(Number(e.target.value))} min={1} required />
        </div>
        <div className="space-y-2">
          <Label>Resolution Time (hours)</Label>
          <Input type="number" value={resolutionTimeHours} onChange={(e) => setResolutionTimeHours(Number(e.target.value))} min={1} required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Escalate Response After (hours)</Label>
          <Input type="number" value={escalateAfterResponseHours} onChange={(e) => setEscalateAfterResponseHours(Number(e.target.value))} min={0} />
        </div>
        <div className="space-y-2">
          <Label>Escalate Resolution After (hours)</Label>
          <Input type="number" value={escalateAfterResolutionHours} onChange={(e) => setEscalateAfterResolutionHours(Number(e.target.value))} min={0} />
        </div>
        <div className="space-y-2">
          <Label>Escalate To</Label>
          <Select value={escalateToRole} onValueChange={(v) => setEscalateToRole(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              <SelectItem value="TeamLead">TeamLead</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          <Label>Default Policy</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Active</Label>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : initialData ? "Update Policy" : "Create Policy"}
      </Button>
    </form>
  );
}