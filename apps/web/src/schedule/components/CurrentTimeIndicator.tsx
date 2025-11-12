import React from "react";
import { isToday } from "date-fns";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useCurrentTimeIndicator } from "../hooks/timeUtils";

interface DayViewProps {
  view: "day";
}

interface WeekViewProps {
  day: Date;
  view: "week";
}

type Props = DayViewProps | WeekViewProps;

export const CurrentTimeIndicator = (props: Props) => {
  const currentDate = useCalendarViewStore((state) => state.currentDate);

  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    props.view,
  );

  if (props.view === "day" && !currentTimeVisible) {
    return null;
  }

  if (props.view === "week" && (!currentTimeVisible || !isToday(props.day))) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20"
      style={{ top: `${currentTimePosition}%` }}
    >
      <div className="relative flex items-center">
        <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
        <div className="bg-primary h-[2px] w-full"></div>
      </div>
    </div>
  );
};
