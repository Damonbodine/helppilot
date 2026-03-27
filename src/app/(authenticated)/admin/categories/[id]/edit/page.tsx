"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { CategoryForm } from "@/components/category-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";
export default function EditCategoryPage() {
  const params = useParams();
  const user = useQuery(api.users.getCurrentUser);
  const category = useQuery(api.categories.getById, user === undefined ? "skip" : { categoryId: params.id as Id<"categories"> });
  if (category === undefined) return <LoadingSkeleton type="detail" />;
  if (!category) return <div>Not found</div>;
  return (<div className="space-y-6"><h1 className="text-2xl font-bold">Edit Category</h1><CategoryForm initialData={category as any} /></div>);
}
