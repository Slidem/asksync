"use client";

import { TagDialogProvider } from "@/tags/components/dialog/TagDialogContext";
import { TagList } from "@/tags/components/TagList";

export default function TagsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <TagDialogProvider>
        <TagList />
      </TagDialogProvider>
    </div>
  );
}
