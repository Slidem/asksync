import {
  FocusMode,
  PomodoroSettings,
  SessionStats,
  SessionStatus,
  SessionType,
} from "../types";

import { Id } from "@/../../backend/convex/_generated/dataModel";
import { create } from "zustand";

interface WorkModeState {
  // Session data
  activeSessionId: Id<"workSessions"> | null;
  sessionType: SessionType;
  sessionStatus: SessionStatus | null;
  focusMode: FocusMode;

  // Timer state
  targetDuration: number; // in milliseconds
  remainingTime: number; // in milliseconds
  isRunning: boolean;
  isPaused: boolean;

  // Current work context
  currentTimeblockId: Id<"timeblocks"> | null;
  currentTaskId: Id<"tasks"> | null;
  currentQuestionId: Id<"questions"> | null;

  // Settings
  settings: PomodoroSettings | null;
  deviceId: string;

  // Session tracking
  sessionCount: number; // work sessions today
  completedWorkSessions: number; // completed work sessions since last long break
  todaysStats: SessionStats | null;

  // Actions
  setActiveSession: (sessionId: Id<"workSessions"> | null) => void;
  setSessionType: (type: SessionType) => void;
  setSessionStatus: (status: SessionStatus | null) => void;
  setFocusMode: (mode: FocusMode) => void;

  setTargetDuration: (duration: number) => void;
  setRemainingTime: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setIsPaused: (paused: boolean) => void;

  setCurrentTimeblock: (id: Id<"timeblocks"> | null) => void;
  setCurrentTask: (id: Id<"tasks"> | null) => void;
  setCurrentQuestion: (id: Id<"questions"> | null) => void;

  setSettings: (settings: PomodoroSettings) => void;
  setDeviceId: (id: string) => void;

  setSessionCount: (count: number) => void;
  setCompletedWorkSessions: (count: number) => void;
  incrementCompletedWorkSessions: () => void;
  resetCompletedWorkSessions: () => void;
  setTodaysStats: (stats: SessionStats | null) => void;

  // Helper actions
  tick: () => void;
  reset: () => void;
}

// Generate or retrieve device ID
const getDeviceId = (): string => {
  if (typeof window === "undefined") return "unknown";

  let deviceId = localStorage.getItem("workModeDeviceId");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("workModeDeviceId", deviceId);
  }
  return deviceId;
};

export const useWorkModeStore = create<WorkModeState>((set, get) => ({
  // Initial state
  activeSessionId: null,
  sessionType: "work",
  sessionStatus: null,
  focusMode: "normal",

  targetDuration: 25 * 60 * 1000, // 25 minutes default
  remainingTime: 25 * 60 * 1000,
  isRunning: false,
  isPaused: false,

  currentTimeblockId: null,
  currentTaskId: null,
  currentQuestionId: null,

  settings: null,
  deviceId: getDeviceId(),

  sessionCount: 0,
  completedWorkSessions: 0,
  todaysStats: null,

  // Actions
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
  setSessionType: (type) => set({ sessionType: type }),
  setSessionStatus: (status) => set({ sessionStatus: status }),
  setFocusMode: (mode) => {
    const settings = get().settings;
    if (settings && mode !== "custom") {
      const preset = settings.presets[mode];
      const sessionType = get().sessionType;
      let duration: number;

      if (sessionType === "work") {
        duration = preset.work * 60 * 1000;
      } else if (sessionType === "shortBreak") {
        duration = preset.shortBreak * 60 * 1000;
      } else {
        duration = preset.longBreak * 60 * 1000;
      }

      set({
        focusMode: mode,
        targetDuration: duration,
        remainingTime: duration,
      });
    } else {
      set({ focusMode: mode });
    }
  },

  setTargetDuration: (duration) =>
    set({ targetDuration: duration, remainingTime: duration }),
  setRemainingTime: (time) => set({ remainingTime: time }),
  setIsRunning: (running) => set({ isRunning: running }),
  setIsPaused: (paused) => set({ isPaused: paused }),

  setCurrentTimeblock: (id) => set({ currentTimeblockId: id }),
  setCurrentTask: (id) => set({ currentTaskId: id }),
  setCurrentQuestion: (id) => set({ currentQuestionId: id }),

  setSettings: (settings) => {
    const currentMode = settings.currentFocusMode;
    const sessionType = get().sessionType;

    if (currentMode !== "custom") {
      const preset = settings.presets[currentMode];
      let duration: number;

      if (sessionType === "work") {
        duration = preset.work * 60 * 1000;
      } else if (sessionType === "shortBreak") {
        duration = preset.shortBreak * 60 * 1000;
      } else {
        duration = preset.longBreak * 60 * 1000;
      }

      set({
        settings,
        focusMode: currentMode,
        targetDuration: duration,
        remainingTime: duration,
      });
    } else {
      set({ settings });
    }
  },

  setDeviceId: (id) => set({ deviceId: id }),

  setSessionCount: (count) => set({ sessionCount: count }),
  setCompletedWorkSessions: (count) => set({ completedWorkSessions: count }),
  incrementCompletedWorkSessions: () =>
    set((state) => ({
      completedWorkSessions: state.completedWorkSessions + 1,
    })),
  resetCompletedWorkSessions: () => set({ completedWorkSessions: 0 }),
  setTodaysStats: (stats) => set({ todaysStats: stats }),

  tick: () => {
    const { remainingTime, isRunning, isPaused } = get();
    if (isRunning && !isPaused && remainingTime > 0) {
      set({ remainingTime: Math.max(0, remainingTime - 1000) });
    }
  },

  reset: () => {
    const { targetDuration } = get();
    set({
      remainingTime: targetDuration,
      isRunning: false,
      isPaused: false,
      sessionStatus: null,
      activeSessionId: null,
    });
  },
}));
