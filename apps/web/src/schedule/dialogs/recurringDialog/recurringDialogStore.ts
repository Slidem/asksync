import { CalendarEvent } from "@/schedule/types";
import { create } from "zustand";

export type ActionType = "update" | "delete" | null;

interface Props {
  event: CalendarEvent | null;
  isOpen: boolean;
  open: (action: ActionType, event: CalendarEvent) => void;
  close: () => void;
  actionType: ActionType;
}

export const useRecurringDialogStore = create<Props>((set) => ({
  event: null,
  isOpen: false,
  actionType: null,
  open: (action: ActionType, event: CalendarEvent) =>
    set({ event, isOpen: true, actionType: action }),
  close: () => set({ event: null, isOpen: false, actionType: null }),
}));
