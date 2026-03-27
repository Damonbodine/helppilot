"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { SLAPolicyForm } from "@/components/sla-policy-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";
export default function EditPolicyPage() {
  const params = useParams();
  const user = useQuery(api.users.getCurrentUser);
  const policy = useQuery(api.slaPolicies.getById, user === undefined ? "skip" : { policyId: params.id as Id<"slaPolicies"> });
  if (policy === undefined) return <LoadingSkeleton type="detail" />;
  if (!policy) return <div>Not found</div>;
  return (<div className="space-y-6"><h1 className="text-2xl font-bold">Edit SLA Policy</h1><SLAPolicyForm initialData={policy as any} /></div>);
}
