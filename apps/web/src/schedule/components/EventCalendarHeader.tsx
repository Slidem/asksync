"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { useCallback, useEffect, useMemo } from "react";

import { AGENDA_DAYS_TO_SHOW } from "@/schedule/constants";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/schedule/types";
import { RiCalendarCheckLine } from "@remixicon/react";
import { useCalendarViewStore } from "@/schedule/stores/calendarViewStore";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useOpenCreateEventDialogAtNow } from "@/schedule/dialogs/eventDialog/eventDialogService";

export const EventCalendarHeader = () => {
  const view = useCalendarViewStore((state) => state.calendarView);
  const setView = useCalendarViewStore((state) => state.setCalendarView);
  const currentDate = useCalendarViewStore((state) => state.currentDate);
  const setCurrentDate = useCalendarViewStore((state) => state.setCurrentDate);
  const openCreateEventDialogAtNow = useOpenCreateEventDialogAtNow();
  const isOpen = useEventDialogStore((state) => state.isOpen);
  const selectedUserId = useCalendarViewStore((state) => state.selectedUserId);
  const isReadOnly = selectedUserId !== null;

  const handlePrevious = useCallback(() => {
    let newDate: Date;
    if (view === CalendarView.MONTH) {
      newDate = subMonths(currentDate, 1);
    } else if (view === CalendarView.WEEK) {
      newDate = subWeeks(currentDate, 1);
    } else if (view === CalendarView.DAY) {
      newDate = addDays(currentDate, -1);
    } else if (view === CalendarView.AGENDA) {
      newDate = addDays(currentDate, -AGENDA_DAYS_TO_SHOW);
    } else {
      newDate = currentDate;
    }
    setCurrentDate(newDate);
  }, [view, currentDate, setCurrentDate]);

  const handleNext = useCallback(() => {
    let newDate: Date;
    if (view === "month") {
      newDate = addMonths(currentDate, 1);
    } else if (view === "week") {
      newDate = addWeeks(currentDate, 1);
    } else if (view === "day") {
      newDate = addDays(currentDate, 1);
    } else if (view === "agenda") {
      newDate = addDays(currentDate, AGENDA_DAYS_TO_SHOW);
    } else {
      newDate = currentDate;
    }
    setCurrentDate(newDate);
  }, [view, currentDate, setCurrentDate]);

  const handleToday = useCallback(() => {
    const newDate = new Date();
    setCurrentDate(newDate);
  }, [setCurrentDate]);

  const handleViewChange = useCallback(
    (newView: CalendarView) => {
      setView(newView);
    },
    [setView],
  );

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          handleViewChange(CalendarView.MONTH);
          break;
        case "w":
          handleViewChange(CalendarView.WEEK);
          break;
        case "d":
          handleViewChange(CalendarView.DAY);
          break;
        case "a":
          handleViewChange(CalendarView.AGENDA);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleViewChange]);

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else if (view === "day") {
      return (
        <>
          <span className="min-[480px]:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      );
    } else if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate;
      const end = addDays(currentDate, AGENDA_DAYS_TO_SHOW - 1);

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  }, [currentDate, view]);

  return (
    <>
      <div className={"flex items-center justify-between p-2 sm:p-4 h-full"}>
        <div className="flex items-center gap-1 sm:gap-4">
          <Button
            variant="outline"
            className="max-[479px]:aspect-square max-[479px]:p-0!"
            onClick={handleToday}
          >
            <RiCalendarCheckLine
              className="min-[480px]:hidden"
              size={16}
              aria-hidden="true"
            />
            <span className="max-[479px]:sr-only">Today</span>
          </Button>
          <div className="flex items-center sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              aria-label="Previous"
            >
              <ChevronLeftIcon size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRightIcon size={16} aria-hidden="true" />
            </Button>
          </div>
          <h2 className="text-sm font-semibold sm:text-lg md:text-xl">
            {viewTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                <span>
                  <span className="min-[480px]:hidden" aria-hidden="true">
                    {view.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-[479px]:sr-only">
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </span>
                </span>
                <ChevronDownIcon
                  className="-me-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
              <DropdownMenuItem
                onClick={() => handleViewChange(CalendarView.MONTH)}
              >
                Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewChange(CalendarView.WEEK)}
              >
                Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewChange(CalendarView.DAY)}
              >
                Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewChange(CalendarView.AGENDA)}
              >
                Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!isReadOnly && (
            <Button
              className="max-[479px]:aspect-square max-[479px]:p-0!"
              size="sm"
              onClick={openCreateEventDialogAtNow}
            >
              <PlusIcon
                className="opacity-60 sm:-ms-1"
                size={16}
                aria-hidden="true"
              />
              <span className="max-sm:sr-only">New event</span>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
