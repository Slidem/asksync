import { ChevronDown, Clock, MapPin } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SortOrder, TagSortBy } from "@asksync/shared";

import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/schedule";
import { format } from "date-fns";
import { useTags } from "@/tags/hooks/queries";

interface AvailableTimeblocksListProps {
  timeblocks: CalendarEvent[] | undefined;
}

export function AvailableTimeblocksList({
  timeblocks,
}: AvailableTimeblocksListProps): React.ReactNode {
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
    <div className="space-y-2">
      {timeblocks.map((timeblock, index) => (
        <Collapsible
          key={`${timeblock.id}-${timeblock.start.getTime()}-${index}`}
        >
          <CollapsibleTrigger className="w-full group">
            <div className="bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {timeblock.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(timeblock.start, "MMM d, h:mm a")} -{" "}
                      {format(timeblock.end, "h:mm a")}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 py-3 space-y-2 text-sm">
              {/* Duration */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Duration:{" "}
                  {formatDuration(
                    timeblock.start.getTime(),
                    timeblock.end.getTime(),
                  )}
                </span>
              </div>

              {/* Location */}
              {timeblock.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{timeblock.location}</span>
                </div>
              )}

              {/* Description */}
              {timeblock.description && (
                <div className="text-muted-foreground pt-1">
                  {timeblock.description}
                </div>
              )}

              {/* Tags */}
              {timeblock.tagIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
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
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
