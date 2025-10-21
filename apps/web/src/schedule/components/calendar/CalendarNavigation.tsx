"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { RiCalendarCheckLine } from "@remixicon/react";
import { useCalendarNavigation } from "@/schedule/stores";

/**
 * Calendar navigation controls
 * Provides Today, Previous, and Next buttons
 */
export function CalendarNavigation() {
  const { goToToday, goToPrevious, goToNext } = useCalendarNavigation();

  return (
    <div className="flex items-center gap-1 sm:gap-4">
      <Button
        variant="outline"
        className="max-[479px]:aspect-square max-[479px]:p-0!"
        onClick={goToToday}
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
          onClick={goToPrevious}
          aria-label="Previous"
        >
          <ChevronLeftIcon size={16} aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          aria-label="Next"
        >
          <ChevronRightIcon size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}