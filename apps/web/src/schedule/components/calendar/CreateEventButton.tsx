"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useEventDialog } from "@/schedule/stores";

/**
 * Create event button
 * Opens the event creation dialog directly via store
 */
export function CreateEventButton() {
  const { open } = useEventDialog();

  return (
    <Button
      className="max-[479px]:aspect-square max-[479px]:p-0!"
      size="sm"
      onClick={() => open()}
    >
      <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
      <span className="max-sm:sr-only">New event</span>
    </Button>
  );
}