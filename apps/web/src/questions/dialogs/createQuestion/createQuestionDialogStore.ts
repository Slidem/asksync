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
  selectedUserId: string | null;

  // Step 2: Availability selection
  selectedTagIds: string[];
  selectedTimeblock: ExpandedTimeblock | null;

  // Step 3: Question details
  questionTitle: string;
  questionContent: string;

  // Actions
  openDialog: () => void;
  closeDialog: () => void;
  reset: () => void;
  setStep: (step: 1 | 2 | 3) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Step 1 actions
  setSelectedUserId: (userId: string | null) => void;

  // Step 2 actions
  setSelectedTagIds: (tagIds: string[]) => void;
  setSelectedTimeblock: (timeblock: ExpandedTimeblock | null) => void;

  // Step 3 actions
  setQuestionTitle: (title: string) => void;
  setQuestionContent: (content: string) => void;

  // Validation
  canProceedFromStep1: () => boolean;
  canProceedFromStep2: () => boolean;
  canSubmit: () => boolean;
}

const initialState = {
  isOpen: false,
  step: 1 as const,
  selectedUserId: null,
  selectedTagIds: [],
  selectedTimeblock: null,
  questionTitle: "",
  questionContent: "",
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

    setSelectedUserId: (userId) => set({ selectedUserId: userId }),
    setSelectedTagIds: (tagIds) => set({ selectedTagIds: tagIds }),
    setSelectedTimeblock: (timeblock) => set({ selectedTimeblock: timeblock }),
    setQuestionTitle: (title) => set({ questionTitle: title }),
    setQuestionContent: (content) => set({ questionContent: content }),

    canProceedFromStep1: () => {
      const { selectedUserId } = get();
      return selectedUserId !== null;
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
