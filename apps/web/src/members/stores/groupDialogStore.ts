import { create } from "zustand";

interface GroupDialogState {
  isOpen: boolean;
  groupId: string | null;
  name: string;
  description: string;
  color: string;
  isSubmitting: boolean;
}

interface GroupDialogActions {
  openCreate: () => void;
  openEdit: (
    groupId: string,
    name: string,
    description: string | undefined,
    color: string,
  ) => void;
  close: () => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setColor: (color: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

const DEFAULT_COLOR = "#3b82f6";

const initialState: GroupDialogState = {
  isOpen: false,
  groupId: null,
  name: "",
  description: "",
  color: DEFAULT_COLOR,
  isSubmitting: false,
};

export const useGroupDialogStore = create<
  GroupDialogState & GroupDialogActions
>((set) => ({
  ...initialState,

  openCreate: () =>
    set({
      isOpen: true,
      groupId: null,
      name: "",
      description: "",
      color: DEFAULT_COLOR,
      isSubmitting: false,
    }),

  openEdit: (groupId, name, description, color) =>
    set({
      isOpen: true,
      groupId,
      name,
      description: description || "",
      color,
      isSubmitting: false,
    }),

  close: () => set({ isOpen: false }),

  setName: (name) => set({ name }),

  setDescription: (description) => set({ description }),

  setColor: (color) => set({ color }),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  reset: () => set(initialState),
}));
