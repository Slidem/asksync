import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { Tag } from "@asksync/shared";

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  expectedAnswerTime?: Date | null;
}

export function TagSelector({
  tags,
  selectedTagIds,
  onTagToggle,
  expectedAnswerTime,
}: TagSelectorProps): React.ReactNode {
  if (!tags.length) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No tags available</p>
        <Link href="/tags">
          <Button variant="outline" size="sm" className="mt-2">
            Create Tags
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => onTagToggle(tag.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTagToggle(tag.id);
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-input"
              }`}
            >
              {selectedTagIds.includes(tag.id) && <Check className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  style={{
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {tag.answerMode === "on-demand"
                    ? `${tag.responseTimeMinutes}min response`
                    : "Scheduled response"}
                </span>
              </div>
              {tag.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {tag.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTagIds.length > 0 && expectedAnswerTime && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">
              Expected answer by: {expectedAnswerTime.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
