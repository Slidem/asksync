import { Clock, MapPin } from "lucide-react";
import { SortOrder, TagSortBy } from "@asksync/shared";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExpandedTimeblock } from "../dialogs/createQuestion/createQuestionDialogStore";
import { format } from "date-fns";
import { useTags } from "@/tags/hooks/queries";

interface AvailableTimeblocksListProps {
  timeblocks: ExpandedTimeblock[] | undefined;
  selectedTimeblock: ExpandedTimeblock | null;
  onSelect: (timeblock: ExpandedTimeblock) => void;
}

export function AvailableTimeblocksList({
  timeblocks,
  selectedTimeblock,
  onSelect,
}: AvailableTimeblocksListProps) {
  const { tags } = useTags({
    sorting: { sortBy: TagSortBy.NAME, sortOrder: SortOrder.ASC },
  });

  const getTagById = (tagId: string) => tags.find((tag) => tag.id === tagId);

  const formatDuration = (startTime: number, endTime: number) => {
    const minutes = Math.round((endTime - startTime) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  if (!timeblocks || timeblocks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No available timeblocks match selected tags</p>
        <p className="text-sm mt-2">
          Try selecting different tags or skip this step
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timeblocks.map((timeblock, index) => {
        const isSelected =
          selectedTimeblock?.timeblockId === timeblock.timeblockId &&
          selectedTimeblock?.startTime === timeblock.startTime;

        return (
          <Card
            key={`${timeblock.timeblockId}-${timeblock.startTime}-${index}`}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isSelected
                ? "border-primary border-2 bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onSelect(timeblock)}
          >
            {/* Date and time */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold text-base">
                  {format(new Date(timeblock.startTime), "EEEE, MMM d")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {format(new Date(timeblock.startTime), "h:mm a")} -{" "}
                    {format(new Date(timeblock.endTime), "h:mm a")}
                  </span>
                  <span className="text-xs">({timeblock.timezone})</span>
                  <span className="mx-1">•</span>
                  <span className="text-xs">
                    {formatDuration(timeblock.startTime, timeblock.endTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="font-medium text-sm mb-2">{timeblock.title}</div>

            {/* Location */}
            {timeblock.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span>{timeblock.location}</span>
              </div>
            )}

            {/* Tags */}
            {timeblock.tagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {timeblock.tagIds.map((tagId) => {
                  const tag = getTagById(tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tagId}
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: `${tag.color}15`,
                        borderColor: tag.color,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
