"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { TagForm } from "@/components/tag-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";
export default function EditTagPage() {
  const params = useParams();
  const user = useQuery(api.users.getCurrentUser);
  const tag = useQuery(api.tags.list, user === undefined ? "skip" : {});
  const found = tag?.find(t => t._id === params.id);
  if (tag === undefined) return <LoadingSkeleton type="detail" />;
  if (!found) return <div>Not found</div>;
  return (<div className="space-y-6"><h1 className="text-2xl font-bold">Edit Tag</h1><TagForm initialData={found as any} /></div>);
}
