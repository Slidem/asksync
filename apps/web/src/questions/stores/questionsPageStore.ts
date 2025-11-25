import { QuestionFilters } from "@asksync/shared";
import { create } from "zustand";

export type TabType = "created" | "assigned" | "participating";

interface State {
  activeTab: TabType;
  filters: QuestionFilters;
  cursor: string | undefined;
  setActiveTab: (tab: TabType) => void;
  setFilters: (
    filters: QuestionFilters | ((prev: QuestionFilters) => QuestionFilters),
  ) => void;
  updateFilter: (key: keyof QuestionFilters, value: string | string[]) => void;
  setCursor: (cursor: string | undefined) => void;
  resetFilters: () => void;
}

const defaultFilters: QuestionFilters = {
  search: "",
  status: "all",
  sortBy: "expectedTime",
  tagIds: [],
};

export const useQuestionsPageStore = create<State>((set) => ({
  activeTab: "assigned",
  filters: defaultFilters,
  cursor: undefined,
  setActiveTab: (tab) => set({ activeTab: tab, cursor: undefined }),
  setFilters: (filters) =>
    set((state) => ({
      filters: typeof filters === "function" ? filters(state.filters) : filters,
      cursor: undefined,
    })),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      cursor: undefined,
    })),
  setCursor: (cursor) => set({ cursor }),
  resetFilters: () => set({ filters: defaultFilters, cursor: undefined }),
}));
