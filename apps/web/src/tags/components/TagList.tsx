"use client";

import { Filter, Search } from "lucide-react";
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
import { Tag } from "@asksync/shared";
import { TagCard } from "./cards/TagCard";
import { useState } from "react";

interface TagListProps {
  tags: Tag[];
  currentUserId?: string;
}

type FilterMode = "all" | "my-tags" | "public";

type SortMode = "name" | "created" | "updated";

export function TagList({ tags, currentUserId }: TagListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");

  // Filter tags based on search term and filter mode
  const filteredTags = tags.filter((tag) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description &&
        tag.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Mode filter
    switch (filterMode) {
      case "my-tags":
        return tag.createdBy === currentUserId;
      case "public":
        return tag.isPublic;
      default:
        return true;
    }
  });

  // Sort tags
  const sortedTags = [...filteredTags].sort((a, b) => {
    switch (sortMode) {
      case "created":
        return b.createdAt - a.createdAt;
      case "updated":
        return b.updatedAt - a.updatedAt;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getFilterCount = (mode: FilterMode) => {
    switch (mode) {
      case "my-tags":
        return tags.filter((tag) => tag.createdBy === currentUserId).length;
      case "public":
        return tags.filter((tag) => tag.isPublic).length;
      default:
        return tags.length;
    }
  };

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
            value={filterMode}
            onValueChange={(value: FilterMode) => setFilterMode(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Tags ({getFilterCount("all")})
              </SelectItem>
              <SelectItem value="my-tags">
                My Tags ({getFilterCount("my-tags")})
              </SelectItem>
              <SelectItem value="public">
                Public ({getFilterCount("public")})
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Mode */}
          <Select
            value={sortMode}
            onValueChange={(value: SortMode) => setSortMode(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {(searchTerm || filterMode !== "all") && (
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
          {filterMode !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filterMode === "my-tags" && "My Tags"}
              {filterMode === "public" && "Public"}
              <button
                onClick={() => setFilterMode("all")}
                className="ml-1 hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedTags.length} of {tags.length} tags
      </div>

      {/* Tag List */}
      <div className="space-y-4">
        {sortedTags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            isOwner={tag.createdBy === currentUserId}
          />
        ))}
        <NewTagCard />
      </div>

      {sortedTags.length === 0 && (searchTerm || filterMode !== "all") && (
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
