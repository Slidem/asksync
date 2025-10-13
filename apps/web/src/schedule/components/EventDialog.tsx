"use client";

import type { CalendarEvent } from "@/schedule/types";
import { EventDialogContainer } from "./dialog/EventDialogContainer";
import type { Tag } from "@asksync/shared";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  availableTags?: Tag[];
}

export function EventDialog(props: EventDialogProps) {
  return <EventDialogContainer {...props} />;
}
