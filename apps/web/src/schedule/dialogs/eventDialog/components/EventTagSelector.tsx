"use client";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import type { Tag } from "@asksync/shared";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";
import { useTags } from "@/tags/hooks/queries";
import { CreateTagButton } from "@/schedule/dialogs/eventDialog/components/CreateTagButton";
import { InlineTagCreateForm } from "@/schedule/dialogs/eventDialog/components/InlineTagCreateForm";

export const EventTagSelector: React.FC = () => {
  const { tags: availableTags } = useTags({});
  const { selectedTagIds, toggleTagId } = useEventDialogStore(
    useShallow((state) => ({
      selectedTagIds: state.formFields.selectedTagIds,
      toggleTagId: state.toggleTagId,
    })),
  );

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreatingTag, setIsCreatingTag] = React.useState(false);

  const selectedTags = React.useMemo(() => {
    return availableTags.filter((tag) => selectedTagIds.includes(tag.id));
  }, [availableTags, selectedTagIds]);

  const filteredAvailableTags = React.useMemo(() => {
    if (!searchQuery) return availableTags;
    return availableTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [availableTags, searchQuery]);

  const handleTagToggle = React.useCallback(
    (tagId: string) => {
      toggleTagId(tagId);
    },
    [toggleTagId],
  );

  const handleRemoveTag = React.useCallback(
    (tagId: string) => {
      toggleTagId(tagId);
    },
    [toggleTagId],
  );

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleStartCreatingTag = React.useCallback(() => {
    setIsCreatingTag(true);
  }, []);

  const handleCancelCreatingTag = React.useCallback(() => {
    setIsCreatingTag(false);
  }, []);

  const handleTagCreated = React.useCallback(
    (newTagId: string) => {
      toggleTagId(newTagId);
      setIsCreatingTag(false);
      setSearchQuery("");
    },
    [toggleTagId],
  );

  // Reset creating state when expanded state changes
  React.useEffect(() => {
    if (!isExpanded) {
      setIsCreatingTag(false);
    }
  }, [isExpanded]);

  return (
    <div className="space-y-3">
      <Label>Associated Tags</Label>

      {/* Selected Tags Display */}
      <div className="space-y-2">
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <SelectedTagBadge
                key={tag.id}
                tag={tag}
                onRemove={handleRemoveTag}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2">
            No tags selected
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleExpanded}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {isExpanded ? "Hide tag selection" : "Add more tags"}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expandable Tag Selection */}
      {isExpanded && (
        <div className="space-y-3 border rounded-md p-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>

          {/* Tag List */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredAvailableTags.length === 0 ? (
              <div className="py-2">
                {searchQuery.trim() ? (
                  isCreatingTag ? (
                    <InlineTagCreateForm
                      initialName={searchQuery.trim()}
                      onSuccess={handleTagCreated}
                      onCancel={handleCancelCreatingTag}
                    />
                  ) : (
                    <CreateTagButton
                      searchQuery={searchQuery.trim()}
                      onClick={handleStartCreatingTag}
                    />
                  )
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No tags available
                  </div>
                )}
              </div>
            ) : (
              filteredAvailableTags.map((tag) => (
                <TagCheckboxItem
                  key={tag.id}
                  tag={tag}
                  isSelected={selectedTagIds.includes(tag.id)}
                  onToggle={handleTagToggle}
                />
              ))
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Select tags that define when you're available to answer questions
      </p>
    </div>
  );
};

interface SelectedTagBadgeProps {
  tag: Tag;
  onRemove: (tagId: string) => void;
}

const SelectedTagBadge = React.memo<SelectedTagBadgeProps>(
  ({ tag, onRemove }) => {
    const handleRemove = React.useCallback(() => {
      onRemove(tag.id);
    }, [onRemove, tag.id]);

    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-2 px-3 py-1.5 pr-1.5"
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <span>{tag.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    );
  },
);

interface TagCheckboxItemProps {
  tag: Tag;
  isSelected: boolean;
  onToggle: (tagId: string) => void;
}

const TagCheckboxItem = React.memo<TagCheckboxItemProps>(
  ({ tag, isSelected, onToggle }) => {
    const handleToggle = React.useCallback(() => {
      onToggle(tag.id);
    }, [onToggle, tag.id]);

    return (
      <div
        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <Checkbox
          checked={isSelected}
          onChange={handleToggle}
          className="pointer-events-none"
        />
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tag.color }}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">{tag.name}</div>
            {tag.description && (
              <div className="text-xs text-muted-foreground">
                {tag.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

SelectedTagBadge.displayName = "SelectedTagBadge";
TagCheckboxItem.displayName = "TagCheckboxItem";
EventTagSelector.displayName = "EventTagSelector";
