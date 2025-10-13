"use client";

import { Tag } from "@asksync/shared";
import { TagDialogProvider } from "@/tags/components/dialog/TagDialogContext";
import { TagList } from "@/tags/components/TagList";
import { api } from "@convex/api";
import { docToTag } from "@/lib/convexTypes";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";

export default function TagsPage() {
  const { user } = useUser();
  const rawTags = useQuery(api.tags.queries.listTagsByOrg) || [];
  const tags: Tag[] = rawTags.map(docToTag);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <TagDialogProvider>
        <TagList tags={tags} currentUserId={user?.id} />
      </TagDialogProvider>
    </div>
  );
}
