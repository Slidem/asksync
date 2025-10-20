"use client";

import { Filter, Search } from "lucide-react";
import { SearchTagCategory, SortOrder, TagSortBy } from "@asksync/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NewTagButton } from "@/tags/components/cards/NewTagButton";
import { NewTagCard } from "@/tags/components/cards/NewTagCard";
import { TagCard } from "./cards/TagCard";
import { useState } from "react";
import { useTags } from "@/tags/hooks/queries";
import { useUser } from "@clerk/nextjs";

export function TagList() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<SearchTagCategory>(
    SearchTagCategory.ALL,
  );
  const [sortBy, setSortBy] = useState<TagSortBy>(TagSortBy.NAME);

  const { tags, totalPublicTags, totalUserTags, totalVisibleTags } = useTags({
    filter: { category: filterCategory, searchTerm },
    sorting: {
      sortBy,
      sortOrder: sortBy === TagSortBy.NAME ? SortOrder.ASC : SortOrder.DESC,
    },
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

      {/* Filters and Search */}
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

        <div className="flex items-center gap-2">
          {/* Filter Mode */}
          <Select
            value={filterCategory}
            onValueChange={(value: SearchTagCategory) =>
              setFilterCategory(value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags ({totalVisibleTags})</SelectItem>
              <SelectItem value="personal">
                My Tags ({totalUserTags})
              </SelectItem>
              <SelectItem value="public">Public ({totalPublicTags})</SelectItem>
            </SelectContent>
          </Select>

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
      </div>

      {(searchTerm || filterCategory !== SearchTagCategory.ALL) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          )}
          {filterCategory !== SearchTagCategory.ALL && (
            <Badge variant="secondary" className="gap-1">
              {filterCategory === SearchTagCategory.PERSONAL && "My Tags"}
              {filterCategory === SearchTagCategory.PUBLIC && "Public"}
              <button
                onClick={() => setFilterCategory(SearchTagCategory.ALL)}
                className="ml-1 hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          )}
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

      {tags.length === 0 &&
        (searchTerm || filterCategory !== SearchTagCategory.ALL) && (
          <div className="text-center py-12">
            <div className="space-y-3">
              <div className="text-muted-foreground">
                No tags match your current filters
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
