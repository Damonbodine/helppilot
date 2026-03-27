"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

type TagFormProps = {
  initialData?: {
    _id: Id<"tags">;
    name: string;
    color: string;
    description?: string;
  };
};

export function TagForm({ initialData }: TagFormProps) {
  const router = useRouter();
  const createTag = useMutation(api.tags.create);
  const updateTag = useMutation(api.tags.update);

  const [name, setName] = useState(initialData?.name ?? "");
  const [color, setColor] = useState(initialData?.color ?? "#3B82F6");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateTag({ tagId: initialData._id, name, color, description: description || undefined });
      } else {
        await createTag({ name, color, description: description || undefined });
      }
      router.push("/admin/tags");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Tag Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2 items-center">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
          <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3B82F6" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : initialData ? "Update Tag" : "Create Tag"}
      </Button>
    </form>
  );
}