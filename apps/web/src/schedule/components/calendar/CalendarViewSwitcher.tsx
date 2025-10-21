"use client";

import { Button } from "@/components/ui/button";
import { CalendarView } from "@/schedule/types";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalendarView } from "@/schedule/stores";

/**
 * Calendar view switcher dropdown
 * Allows switching between month, week, day, and agenda views
 */
export function CalendarViewSwitcher() {
  const { view, setView } = useCalendarView();

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  return (
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
        <DropdownMenuItem onClick={() => handleViewChange("month")}>
          Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewChange("week")}>
          Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewChange("day")}>
          Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewChange("agenda")}>
          Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}