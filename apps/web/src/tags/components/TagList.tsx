"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOrder, TagSortBy } from "@asksync/shared";
import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { List, Search, User, Users } from "lucide-react";
import { NewTagButton } from "@/tags/components/cards/NewTagButton";
import { NewTagCard } from "@/tags/components/cards/NewTagCard";
import { TagCard } from "./cards/TagCard";
import { TagOwnerFilter } from "./TagOwnerFilter";
import { useMemberships } from "@/members/queries/queries";
import { useMemo, useState } from "react";
import { useTags } from "@/tags/hooks/queries";
import { useUser } from "@clerk/nextjs";

type TabFilter = "my-tags" | "others-tags" | "all";

export function TagList() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabFilter>("my-tags");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<TagSortBy>(TagSortBy.NAME);
  const memberships = useMemberships();

  const { tags, myTagsCount, othersTagsCount, allTagsCount } = useTags({
    filter: { searchTerm, ownerIds: selectedOwnerIds },
    sorting: {
      sortBy,
      sortOrder: sortBy === TagSortBy.NAME ? SortOrder.ASC : SortOrder.DESC,
    },
    includeUsageStats: true,
    filterBy: activeTab,
  });

  // Get unique owner IDs from all tags (before owner filter is applied)
  const allTagsForOwners = useTags({
    filterBy: activeTab,
    includeUsageStats: false,
  });

  const availableOwnerIds = useMemo(
    () => [...new Set(allTagsForOwners.tags.map((tag) => tag.createdBy))],
    [allTagsForOwners.tags],
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabFilter);
    setSearchTerm("");
    setSelectedOwnerIds([]);
    setSortBy(TagSortBy.NAME);
  };

  const getEmptyState = () => {
    if (searchTerm) {
      return (
        <div className="text-center py-12">
          <div className="space-y-3">
            <div className="text-muted-foreground">
              No tags match your search
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "my-tags") {
      return (
        <div className="text-center py-12">
          <div className="space-y-3">
            <div className="text-muted-foreground">
              You haven&apos;t created any tags yet
            </div>
            <NewTagButton />
          </div>
        </div>
      );
    }

    if (activeTab === "others-tags") {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No tags have been shared with you yet
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <div className="space-y-3">
          <div className="text-muted-foreground">
            No tags in this organization yet
          </div>
          <NewTagButton />
        </div>
      </div>
    );
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

      {/* Tabs */}
      <UnderlineTabs value={activeTab} onValueChange={handleTabChange}>
        <UnderlineTabsList>
          <UnderlineTabsTrigger
            value="my-tags"
            badge={myTagsCount}
            icon={<User className="h-4 w-4" />}
          >
            <span className="max-sm:sr-only">My Tags</span>
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger
            value="others-tags"
            badge={othersTagsCount}
            icon={<Users className="h-4 w-4" />}
          >
            <span className="max-sm:sr-only">Other People&apos;s Tags</span>
          </UnderlineTabsTrigger>
          <UnderlineTabsTrigger
            value="all"
            badge={allTagsCount}
            icon={<List className="h-4 w-4" />}
          >
            <span className="max-sm:sr-only">All</span>
          </UnderlineTabsTrigger>
        </UnderlineTabsList>

        <UnderlineTabsContent value="my-tags">
          {/* Search and Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
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
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
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
            {tags.length > 0 ? (
              <>
                {tags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    isOwner={tag.createdBy === user?.id}
                  />
                ))}
                <NewTagCard />
              </>
            ) : (
              getEmptyState()
            )}
          </div>
        </UnderlineTabsContent>

        <UnderlineTabsContent value="others-tags">
          {/* Search and Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Owner Filter */}
            <TagOwnerFilter
              selectedOwnerIds={selectedOwnerIds}
              availableOwnerIds={availableOwnerIds}
              onChange={setSelectedOwnerIds}
            />

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

          {(searchTerm || selectedOwnerIds.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
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
              {selectedOwnerIds.map((ownerId) => {
                const owner = memberships.find((m) => m.id === ownerId);
                return (
                  <Badge key={ownerId} variant="secondary" className="gap-1">
                    Owner: {owner?.name || "Unknown"}
                    <button
                      onClick={() =>
                        setSelectedOwnerIds((prev) =>
                          prev.filter((id) => id !== ownerId),
                        )
                      }
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="space-y-4">
            {tags.length > 0
              ? tags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    isOwner={tag.createdBy === user?.id}
                  />
                ))
              : getEmptyState()}
          </div>
        </UnderlineTabsContent>

        <UnderlineTabsContent value="all">
          {/* Search and Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Owner Filter */}
            <TagOwnerFilter
              selectedOwnerIds={selectedOwnerIds}
              availableOwnerIds={availableOwnerIds}
              onChange={setSelectedOwnerIds}
            />

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

          {(searchTerm || selectedOwnerIds.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
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
              {selectedOwnerIds.map((ownerId) => {
                const owner = memberships.find((m) => m.id === ownerId);
                return (
                  <Badge key={ownerId} variant="secondary" className="gap-1">
                    Owner: {owner?.name || "Unknown"}
                    <button
                      onClick={() =>
                        setSelectedOwnerIds((prev) =>
                          prev.filter((id) => id !== ownerId),
                        )
                      }
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="space-y-4">
            {tags.length > 0 ? (
              <>
                {tags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    isOwner={tag.createdBy === user?.id}
                  />
                ))}
                <NewTagCard />
              </>
            ) : (
              getEmptyState()
            )}
          </div>
        </UnderlineTabsContent>
      </UnderlineTabs>
    </div>
  );
}
