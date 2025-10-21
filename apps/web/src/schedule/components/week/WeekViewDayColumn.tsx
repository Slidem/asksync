"use client";

import { EndHour, StartHour } from "@/schedule/constants";
import {
  addHours,
  eachHourOfInterval,
  getHours,
  isToday,
  startOfDay,
} from "date-fns";

import { CalendarEvent } from "@/schedule/types";
import { DraggableEvent } from "@/schedule/components/DraggableEvent";
import { DroppableCell } from "@/schedule/components/DroppableCell";
import { GhostEvent } from "@/schedule/components/GhostEvent";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

interface GhostEventData {
  startTime: Date;
  endTime: Date;
}

interface GhostEventPosition {
  dayIndex: number;
  top: number;
  height: number;
}

interface WeekViewDayColumnProps {
  day: Date;
  dayIndex: number;
  positionedEvents: PositionedEvent[];
  ghostEvent: GhostEventData | null;
  ghostEventPosition: GhostEventPosition | null;
  isDragging: boolean;
  currentTimeVisible: boolean;
  currentTimePosition: number;
  isCreating: boolean;
  onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void;
  onCellMouseDown: (
    e: React.MouseEvent,
    startTime: Date,
    dayIndex: number,
  ) => void;
  onEventCreate: (startTime: Date) => void;
}

export function WeekViewDayColumn({
  day,
  dayIndex,
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
}: WeekViewDayColumnProps) {
  const hours = useMemo(() => {
    const dayStart = startOfDay(day);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [day]);

  return (
    <div
      className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
      data-today={isToday(day) || undefined}
    >
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
          role="button"
          tabIndex={0}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            // Ensure keyboard users don't trigger parent handlers; support Enter and Space
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="size-full">
            <DraggableEvent
              event={positionedEvent.event}
              view="week"
              onClick={(e) => onEventClick(positionedEvent.event, e)}
              showTime
              height={positionedEvent.height}
            />
          </div>
        </div>
      ))}

      {/* Ghost event */}
      {ghostEventPosition &&
        ghostEventPosition.dayIndex === dayIndex &&
        ghostEvent && (
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
              view="week"
              isDragging={isDragging}
            />
          </div>
        )}

      {/* Current time indicator - only show for today's column */}
      {currentTimeVisible && isToday(day) && (
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

      {/* Hour cells with quarter-hour intervals */}
      {hours.map((hour) => {
        const hourValue = getHours(hour);
        return (
          <div
            key={hour.toString()}
            className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
          >
            {/* Quarter-hour intervals */}
            {[0, 1, 2, 3].map((quarter) => {
              const quarterHourTime = hourValue + quarter * 0.25;
              return (
                <DroppableCell
                  key={`${hour.toString()}-${quarter}`}
                  id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                  date={day}
                  time={quarterHourTime}
                  dayColumnIndex={dayIndex}
                  className={cn(
                    "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                    quarter === 0 && "top-0",
                    quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
                    quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
                    quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]",
                  )}
                  onMouseDown={(e, startTime) =>
                    onCellMouseDown(e, startTime, dayIndex)
                  }
                  onClick={
                    !isCreating
                      ? () => {
                          const startTime = new Date(day);
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
  );
}
