import { create } from "zustand";

export interface ExpandedTimeblock {
  timeblockId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: number;
  endTime: number;
  timezone: string;
  tagIds: string[];
  color?: string;
  isRecurring: boolean;
}

interface CreateQuestionDialogState {
  // Dialog state
  isOpen: boolean;
  step: 1 | 2 | 3;

  // Step 1: User selection
  selectedUserIds: string[];

  // Step 2: Availability selection
  selectedTagIds: string[];

  // Step 3: Question details
  questionTitle: string;
  questionContent: string;
  questionContentPlaintext: string;

  // Actions
  openDialog: () => void;
  closeDialog: () => void;
  reset: () => void;
  setStep: (step: 1 | 2 | 3) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Step 1 actions
  setSelectedUserIds: (userIds: string[]) => void;

  // Step 2 actions
  setSelectedTagIds: (tagIds: string[]) => void;

  // Step 3 actions
  setQuestionTitle: (title: string) => void;
  setQuestionContent: (content: string, plaintext: string) => void;

  // Validation
  canProceedFromStep1: () => boolean;
  canProceedFromStep2: () => boolean;
  canSubmit: () => boolean;
}

const initialState = {
  isOpen: false,
  step: 1 as const,
  selectedUserIds: [],
  selectedTagIds: [],
  questionTitle: "",
  questionContent: "",
  questionContentPlaintext: "",
};

export const useCreateQuestionDialogStore = create<CreateQuestionDialogState>(
  (set, get) => ({
    ...initialState,

    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
    reset: () => set(initialState),

    setStep: (step) => set({ step }),
    nextStep: () => {
      const currentStep = get().step;
      if (currentStep < 3) {
        set({ step: (currentStep + 1) as 1 | 2 | 3 });
      }
    },
    previousStep: () => {
      const currentStep = get().step;
      if (currentStep > 1) {
        set({ step: (currentStep - 1) as 1 | 2 | 3 });
      }
    },

    setSelectedUserIds: (userIds) => set({ selectedUserIds: userIds }),
    setSelectedTagIds: (tagIds) => set({ selectedTagIds: tagIds }),
    setQuestionTitle: (title) => set({ questionTitle: title }),
    setQuestionContent: (content, plaintext) =>
      set({ questionContent: content, questionContentPlaintext: plaintext }),

    canProceedFromStep1: () => {
      const { selectedUserIds } = get();
      return selectedUserIds.length > 0;
    },

    canProceedFromStep2: () => {
      // Can always proceed from step 2 (timeblock is optional)
      return true;
    },

    canSubmit: () => {
      const { questionTitle } = get();
      return questionTitle.trim().length > 0;
    },
  }),
);
