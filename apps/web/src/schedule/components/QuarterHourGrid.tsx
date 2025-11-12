"use client";

import React from "react";
import { getHours } from "date-fns";
import { DroppableCell } from "@/schedule/components/DroppableCell";
import { cn } from "@/lib/utils";

interface QuarterHourGridProps {
  hour: Date;
  date: Date;
  dayColumnIndex?: number;
  isCreating: boolean;
  onMouseDown: (
    e: React.MouseEvent,
    startTime: Date,
    dayColumnIndex?: number,
  ) => void;
  onCellClick: (startTime: Date) => void;
  idPrefix: string;
}

/**
 * Reusable component that renders quarter-hour DroppableCells for a given hour
 * Handles positioning and event handlers for each 15-minute interval
 */
export function QuarterHourGrid({
  hour,
  date,
  dayColumnIndex,
  isCreating,
  onMouseDown,
  onCellClick,
  idPrefix,
}: QuarterHourGridProps) {
  const hourValue = getHours(hour);

  return (
    <div
      key={hour.toString()}
      className="border-border/70 relative h-[var(--week-cells-height)] border-b last:border-b-0"
    >
      {/* Quarter-hour intervals */}
      {[0, 1, 2, 3].map((quarter) => {
        const quarterHourTime = hourValue + quarter * 0.25;
        const start = new Date(date);
        start.setHours(hourValue);
        start.setMinutes(quarter * 15);

        return (
          <DroppableCell
            key={`${hour.toString()}-${quarter}`}
            id={`${idPrefix}-${date.toISOString()}-${quarterHourTime}`}
            date={date}
            time={quarterHourTime}
            dayColumnIndex={dayColumnIndex}
            className={cn(
              "absolute h-[calc(var(--week-cells-height)/4)] w-full",
              quarter === 0 && "top-0",
              quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
              quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
              quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]",
            )}
            onMouseDown={(e, startTime) =>
              onMouseDown(e, startTime, dayColumnIndex)
            }
            onClick={!isCreating ? () => onCellClick(start) : undefined}
          />
        );
      })}
    </div>
  );
}
