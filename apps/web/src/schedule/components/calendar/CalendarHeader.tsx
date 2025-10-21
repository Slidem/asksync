"use client";

import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarTitle } from "./CalendarTitle";
import { CalendarViewSwitcher } from "./CalendarViewSwitcher";
import { CreateEventButton } from "./CreateEventButton";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  className?: string;
}

/**
 * Calendar header component
 * Combines navigation, title, view switcher, and create button
 * All components use store directly - no prop drilling
 */
export function CalendarHeader({ className }: CalendarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 sm:p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1 sm:gap-4">
        <CalendarNavigation />
        <CalendarTitle />
      </div>
      <div className="flex items-center gap-2">
        <CalendarViewSwitcher />
        <CreateEventButton />
      </div>
    </div>
  );
}