import { Card, CardContent, CardDescription } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { useTags } from "@/tags/hooks/queries";

interface TagDetailsDisplayProps {
  tagIds: string[];
  title?: string;
  variant?: "detailed" | "simple";
}

export const TagDetailsDisplay = ({
  tagIds,
  title = "Tags",
  variant = "detailed",
}: TagDetailsDisplayProps) => {
  const { tags } = useTags({});

  const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));

  if (selectedTags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No tags assigned</div>
    );
  }

  // Simple variant: just pills
  if (variant === "simple") {
    return (
      <div className="space-y-2">
        {title && <div className="text-sm text-muted-foreground">{title}</div>}
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1.5 py-1 px-2.5"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  // Detailed variant: cards with descriptions
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="space-y-2">
        {selectedTags.map((tag) => (
          <Card key={tag.id}>
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-medium text-sm">{tag.name}</span>
                <Badge
                  variant="secondary"
                  className="text-xs ml-auto flex-shrink-0"
                >
                  {tag.answerMode === "on-demand" ? "On-demand" : "Scheduled"}
                </Badge>
              </div>
              {tag.description && (
                <CardDescription className="text-xs">
                  {tag.description}
                </CardDescription>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
