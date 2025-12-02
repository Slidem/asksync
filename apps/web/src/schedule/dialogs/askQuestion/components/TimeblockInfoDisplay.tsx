import { AlignLeft, Calendar, Clock, MapPin } from "lucide-react";

import { CalendarEvent } from "@/schedule/types";
import { TagDetailsDisplay } from "./TagDetailsDisplay";
import { format } from "date-fns";

interface TimeblockInfoDisplayProps {
  event: CalendarEvent;
}

export const TimeblockInfoDisplay = ({ event }: TimeblockInfoDisplayProps) => {
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
        <div className="flex items-start gap-3 text-sm">
          <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <div>{formatDate(event.start)}</div>
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
    </div>
  );
};
