"use client";

import { EndHour, StartHour } from "@/schedule/constants";
import {
  addHours,
  eachHourOfInterval,
  format,
  getHours,
  startOfDay,
} from "date-fns";

import { CalendarEvent } from "@/schedule/types";
import { DraggableEvent } from "@/schedule/components/DraggableEvent";
import { DroppableCell } from "@/schedule/components/DroppableCell";
import { GhostEvent } from "@/schedule/components/GhostEvent";
import { PositionedEvent } from "@/schedule/utils/eventPositioning";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface GhostEventData {
  startTime: Date;
  endTime: Date;
}

interface GhostEventPosition {
  top: number;
  height: number;
}

interface DayViewTimeGridProps {
  currentDate: Date;
  positionedEvents: PositionedEvent[];
  ghostEvent: GhostEventData | null;
  ghostEventPosition: GhostEventPosition | null;
  isDragging: boolean;
  currentTimeVisible: boolean;
  currentTimePosition: number;
  isCreating: boolean;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onCellMouseDown: (e: React.MouseEvent, startTime: Date) => void;
  onEventCreate: (startTime: Date) => void;
}

export function DayViewTimeGrid({
  currentDate,
  positionedEvents,
  ghostEvent,
  ghostEventPosition,
  isDragging,
  currentTimeVisible,
  currentTimePosition,
  isCreating,
  onEventClick,
  onCellMouseDown,
  onEventCreate,
}: DayViewTimeGridProps) {
  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [currentDate]);

  return (
    <div className="border-border/70 grid flex-1 grid-cols-[3rem_1fr] overflow-hidden border-t sm:grid-cols-[4rem_1fr]">
      <div>
        {hours.map((hour, index) => (
          <div
            key={hour.toString()}
            className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0"
          >
            {index > 0 && (
              <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                {format(hour, "h a")}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="relative">
        {/* Positioned events */}
        {positionedEvents.map((positionedEvent) => (
          <div
            key={positionedEvent.event.id}
            className="absolute z-10 px-0.5"
            style={{
              top: `${positionedEvent.top}px`,
              height: `${positionedEvent.height}px`,
              left: `${positionedEvent.left * 100}%`,
              width: `${positionedEvent.width * 100}%`,
              zIndex: positionedEvent.zIndex,
            }}
          >
            <div className="size-full">
              <DraggableEvent
                event={positionedEvent.event}
                view="day"
                onClick={(e) => onEventClick(positionedEvent.event, e)}
                showTime
                height={positionedEvent.height}
              />
            </div>
          </div>
        ))}

        {/* Ghost event */}
        {ghostEventPosition && ghostEvent && (
          <div
            className="pointer-events-none absolute z-30 px-0.5"
            style={{
              top: `${ghostEventPosition.top}px`,
              height: `${ghostEventPosition.height}px`,
              left: 0,
              right: 0,
            }}
          >
            <GhostEvent
              startTime={ghostEvent.startTime}
              endTime={ghostEvent.endTime}
              view="day"
              isDragging={isDragging}
            />
          </div>
        )}

        {/* Current time indicator */}
        {currentTimeVisible && (
          <div
            className="pointer-events-none absolute right-0 left-0 z-20"
            style={{ top: `${currentTimePosition}%` }}
          >
            <div className="relative flex items-center">
              <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
              <div className="bg-primary h-[2px] w-full"></div>
            </div>
          </div>
        )}

        {/* Time grid */}
        {hours.map((hour) => {
          const hourValue = getHours(hour);
          return (
            <div
              key={hour.toString()}
              className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0"
            >
              {/* Quarter-hour intervals */}
              {[0, 1, 2, 3].map((quarter) => {
                const quarterHourTime = hourValue + quarter * 0.25;
                return (
                  <DroppableCell
                    key={`${hour.toString()}-${quarter}`}
                    id={`day-cell-${currentDate.toISOString()}-${quarterHourTime}`}
                    date={currentDate}
                    time={quarterHourTime}
                    className={cn(
                      "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                      quarter === 0 && "top-0",
                      quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
                      quarter === 2 &&
                        "top-[calc(var(--week-cells-height)/4*2)]",
                      quarter === 3 &&
                        "top-[calc(var(--week-cells-height)/4*3)]",
                    )}
                    onMouseDown={onCellMouseDown}
                    onClick={
                      !isCreating
                        ? () => {
                            const startTime = new Date(currentDate);
                            startTime.setHours(hourValue);
                            startTime.setMinutes(quarter * 15);
                            onEventCreate(startTime);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
