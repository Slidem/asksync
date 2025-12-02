"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOrder, TagSortBy } from "@asksync/shared";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NewTagButton } from "@/tags/components/cards/NewTagButton";
import { NewTagCard } from "@/tags/components/cards/NewTagCard";
import { Search } from "lucide-react";
import { TagCard } from "./cards/TagCard";
import { useState } from "react";
import { useTags } from "@/tags/hooks/queries";
import { useUser } from "@clerk/nextjs";

export function TagList() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<TagSortBy>(TagSortBy.NAME);

  const { tags } = useTags({
    filter: { searchTerm },
    sorting: {
      sortBy,
      sortOrder: sortBy === TagSortBy.NAME ? SortOrder.ASC : SortOrder.DESC,
    },
    includeUsageStats: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1 flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Tags</h2>
          <p className="text-muted-foreground">
            Manage your question categories and availability windows
          </p>
        </div>
        <NewTagButton />
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort Mode */}
        <Select
          value={sortBy}
          onValueChange={(value: TagSortBy) => setSortBy(value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
            <SelectItem value="updatedAt">Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {searchTerm && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <Badge variant="secondary" className="gap-1">
            Search: {searchTerm}
            <button
              onClick={() => setSearchTerm("")}
              className="ml-1 hover:text-foreground"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {tags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            isOwner={tag.createdBy === user?.id}
          />
        ))}
        <NewTagCard />
      </div>

      {tags.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="space-y-3">
            <div className="text-muted-foreground">
              No tags match your search
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
