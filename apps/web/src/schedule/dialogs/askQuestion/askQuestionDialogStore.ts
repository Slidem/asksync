import { create } from "zustand";

interface AskQuestionDialogState {
  isOpen: boolean;
  timeblockId: string | null;
  assigneeUserId: string | null;
  tagIds: string[];
  questionTitle: string;
  questionContent: string;
  questionContentPlaintext: string;
  createdQuestionId: string | null;
}

interface AskQuestionDialogActions {
  openDialog: (params: {
    timeblockId: string;
    assigneeUserId: string;
    tagIds: string[];
  }) => void;
  closeDialog: () => void;
  setQuestionTitle: (title: string) => void;
  setQuestionContent: (content: string, plaintext: string) => void;
  setCreatedQuestionId: (id: string) => void;
  reset: () => void;
}

const initialState: AskQuestionDialogState = {
  isOpen: false,
  timeblockId: null,
  assigneeUserId: null,
  tagIds: [],
  questionTitle: "",
  questionContent: "",
  questionContentPlaintext: "",
  createdQuestionId: null,
};

export const useAskQuestionDialogStore = create<
  AskQuestionDialogState & AskQuestionDialogActions
>((set) => ({
  ...initialState,

  openDialog: ({ timeblockId, assigneeUserId, tagIds }) => {
    set({
      isOpen: true,
      timeblockId,
      assigneeUserId,
      tagIds,
      questionTitle: "",
      questionContent: "",
      createdQuestionId: null,
    });
  },

  closeDialog: () => {
    set({ isOpen: false });
    // Reset immediately on close
    setTimeout(() => {
      set(initialState);
    }, 200); // Small delay for animation
  },

  setQuestionTitle: (title) => set({ questionTitle: title }),

  setQuestionContent: (content, plaintext) =>
    set({ questionContent: content, questionContentPlaintext: plaintext }),

  setCreatedQuestionId: (id) => set({ createdQuestionId: id }),

  reset: () => set(initialState),
}));
