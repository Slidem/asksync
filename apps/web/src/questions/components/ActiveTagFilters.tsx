import { Badge } from "@/components/ui/badge";
import { Tag } from "@asksync/shared";
import { X } from "lucide-react";

interface ActiveTagFiltersProps {
  selectedTagIds: string[];
  tags: Tag[] | undefined;
  onRemoveTag: (tagId: string) => void;
  onClearAll: () => void;
}

export function ActiveTagFilters({
  selectedTagIds,
  tags,
  onRemoveTag,
  onClearAll,
}: ActiveTagFiltersProps): React.ReactNode {
  if (!tags || !selectedTagIds || selectedTagIds.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-muted-foreground self-center">Tags:</span>
      {selectedTagIds.map((tagId) => {
        const tag = tags.find((t) => t.id === tagId);
        if (!tag) return null;
        return (
          <Badge
            key={tagId}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
            style={{
              borderColor: tag.color,
              color: tag.color,
              backgroundColor: `${tag.color}15`,
            }}
          >
            {tag.name}
            <button
              onClick={() => onRemoveTag(tagId)}
              className="ml-1 hover:bg-background rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
      <button
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </button>
    </div>
  );
}
