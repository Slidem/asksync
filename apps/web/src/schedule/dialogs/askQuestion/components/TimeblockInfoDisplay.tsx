import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock,
  MapPin,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { CalendarEvent } from "@/schedule/types";
import { ReadOnlyTaskItem } from "./ReadOnlyTaskItem";
import { TagDetailsDisplay } from "./TagDetailsDisplay";
import { api } from "@convex/api";
import { format } from "date-fns";
import { toTimeblockId } from "@/lib/convexTypes";
import { useQuery } from "convex/react";
import { useState } from "react";

interface TimeblockInfoDisplayProps {
  event: CalendarEvent;
}

export const TimeblockInfoDisplay = ({ event }: TimeblockInfoDisplayProps) => {
  const [isTasksOpen, setIsTasksOpen] = useState(true);

  // Query tasks for this timeblock
  const tasksData = useQuery(
    api.tasks.queries.list,
    event.id ? { timeblockId: toTimeblockId(event.id) } : "skip",
  );

  const canViewTasks = tasksData?.canView ?? false;
  const tasks = tasksData?.tasks ?? [];
  const completedCount = tasks.filter((t) => t.completed).length;

  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{event.title}</h3>
      </div>

      <div className="space-y-3">
        {/* Date and Time */}
        <div className="flex items-start gap-3 text-sm w-full">
          <div className="flex gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>{formatDate(event.start)}</div>
          </div>
          {event.allDay ? (
            <div className="text-muted-foreground">All day</div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {formatTime(event.start)} - {formatTime(event.end)}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>{event.location}</div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="flex items-start gap-3 text-sm">
            <AlignLeft className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {event.tagIds && event.tagIds.length > 0 && (
        <div className="pt-2 border-t">
          <TagDetailsDisplay tagIds={event.tagIds} />
        </div>
      )}

      {/* Tasks/Checklists */}
      {canViewTasks && tasks.length > 0 && (
        <div className="pt-2 border-t">
          <Collapsible open={isTasksOpen} onOpenChange={setIsTasksOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:opacity-70 transition-opacity">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <span>
                  Tasks ({completedCount}/{tasks.length} completed)
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  isTasksOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-1">
                {tasks.map((task) => (
                  <ReadOnlyTaskItem key={task._id} task={task} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};
