import { Check, Tags } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tag } from "@asksync/shared";

interface QuestionsTagFilterProps {
  selectedTagIds: string[];
  tags: Tag[] | undefined;
  onChange: (tagIds: string[]) => void;
}

export function QuestionsTagFilter({
  selectedTagIds,
  tags,
  onChange,
}: QuestionsTagFilterProps) {
  const toggleTag = (tagId: string) => {
    const isSelected = selectedTagIds.includes(tagId);
    const newTagIds = isSelected
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(newTagIds);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[160px] justify-start">
          <Tags className="h-4 w-4 mr-2" />
          {selectedTagIds.length
            ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? "s" : ""}`
            : "All Tags"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2 space-y-1">
          <button
            className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded-sm"
            onClick={() => onChange([])}
          >
            <div className="w-4 h-4" />
            All Tags
          </button>
          {tags?.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded-sm"
                onClick={() => toggleTag(tag.id)}
              >
                {isSelected && <Check className="h-4 w-4 text-primary" />}
                {!isSelected && <div className="w-4 h-4" />}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
