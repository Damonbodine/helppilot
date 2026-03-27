"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

type CategoryFormProps = {
  initialData?: {
    _id: Id<"categories">;
    name: string;
    description?: string;
    defaultPriority: string;
    defaultSLAHours: number;
    parentCategoryId?: Id<"categories">;
    icon?: string;
    isActive: boolean;
  };
};

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const categories = useQuery(api.categories.list, {});
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [defaultPriority, setDefaultPriority] = useState(initialData?.defaultPriority ?? "Medium");
  const [defaultSLAHours, setDefaultSLAHours] = useState(initialData?.defaultSLAHours ?? 24);
  const [parentCategoryId, setParentCategoryId] = useState(initialData?.parentCategoryId ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateCategory({
          categoryId: initialData._id,
          name,
          description: description || undefined,
          defaultPriority: defaultPriority as "Critical" | "High" | "Medium" | "Low",
          defaultSLAHours,
          parentCategoryId: parentCategoryId ? parentCategoryId as Id<"categories"> : undefined,
          icon: icon || undefined,
          isActive,
        });
      } else {
        await createCategory({
          name,
          description: description || undefined,
          defaultPriority: defaultPriority as "Critical" | "High" | "Medium" | "Low",
          defaultSLAHours,
          parentCategoryId: parentCategoryId ? parentCategoryId as Id<"categories"> : undefined,
          icon: icon || undefined,
          isActive,
        });
      }
      router.push("/admin/categories");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Default Priority</Label>
          <Select value={defaultPriority} onValueChange={(v) => setDefaultPriority(v ?? "")}>
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
          <Label htmlFor="slaHours">Default SLA Hours</Label>
          <Input id="slaHours" type="number" value={defaultSLAHours} onChange={(e) => setDefaultSLAHours(Number(e.target.value))} min={1} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Parent Category</Label>
        <Select value={parentCategoryId} onValueChange={(v) => setParentCategoryId(v ?? "")}>
          <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">None (top-level)</SelectItem>
            {categories?.filter(c => c._id !== initialData?._id).map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., monitor, code, wifi" />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        <Label>Active</Label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : initialData ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}