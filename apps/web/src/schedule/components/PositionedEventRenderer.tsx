"use client";

import { CalendarEvent } from "@/schedule/types";
import { DraggableEvent } from "@/schedule/components/DraggableEvent";
import { PositionedEvent } from "../types";
import React from "react";

interface PositionedEventRendererProps {
  positionedEvent: PositionedEvent;
  view: "day" | "week";
  onClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

/**
 * Renders a single positioned event with proper styling and positioning
 * Used by calendar views to display events with calculated positions
 */
export function PositionedEventRenderer({
  positionedEvent,
  view,
  onClick,
}: PositionedEventRendererProps) {
  return (
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
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div className="size-full">
        <DraggableEvent
          event={positionedEvent.event}
          view={view}
          onClick={(e) => onClick(positionedEvent.event, e)}
          showTime
          height={positionedEvent.height}
        />
      </div>
    </div>
  );
}
