import {
  DEFAULT_LONG_BREAK_MINUTES,
  DEFAULT_SHORT_BREAK_MINUTES,
  DEFAULT_WORK_DURATION_MINUTES,
  FocusMode,
  PomodoroSettings,
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
  autoStartCountdown: number | null; // countdown seconds before auto-start
  countdownSoundFired: boolean; // track if 5s warning played

  // Settings
  settings: PomodoroSettings | null;

  completedWorkSessions: number; // completed work sessions since last long break

  // Actions
  setActiveSession: (sessionId: Id<"workSessions"> | null) => void;
  setSessionType: (type: SessionType) => void;
  setSessionStatus: (status: SessionStatus | null) => void;
  setFocusMode: (mode: FocusMode) => void;

  setTargetDuration: (duration: number) => void;
  setRemainingTime: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setAutoStartCountdown: (countdown: number | null) => void;
  setCountdownSoundFired: (fired: boolean) => void;

  setSettings: (settings: PomodoroSettings) => void;

  // Helper actions
  tick: () => void;
  reset: () => void;
  resetToNextSessionType: () => {
    targetDuration: number;
    remainingTime: number;
    sessionType: SessionType;
  };
}

// Generate or retrieve device ID
const getDeviceId = (): string => {
  if (typeof window === "undefined") return "unknown";

  let deviceId = localStorage.getItem("workModeDeviceId");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
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
  autoStartCountdown: null,
  countdownSoundFired: false,

  currentTimeblockId: null,
  currentTaskId: null,

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

  setTargetDuration: (duration) => {
    set({ targetDuration: duration, remainingTime: duration });
  },
  setRemainingTime: (time) => {
    set({ remainingTime: time });
  },
  setIsRunning: (running) => set({ isRunning: running }),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setAutoStartCountdown: (countdown) => set({ autoStartCountdown: countdown }),
  setCountdownSoundFired: (fired) => set({ countdownSoundFired: fired }),

  setSettings: (settings) => set({ settings }),
  tick: () => {
    const { remainingTime, isRunning, isPaused } = get();
    if (isRunning && !isPaused && remainingTime > 0) {
      set({ remainingTime: Math.max(0, remainingTime - 1000) });
    }
  },

  reset: () => {
    const { focusMode, targetDuration, settings } = get();
    let newTargetDuration = targetDuration;

    if (focusMode !== "custom") {
      const preset = settings ? settings.presets[focusMode] : null;
      if (preset) {
        newTargetDuration = minutesToMilliseconds(preset.work);
      }
    }
    set({
      targetDuration: newTargetDuration,
      remainingTime: newTargetDuration,
      sessionType: "work",
      isRunning: false,
      isPaused: false,
      sessionStatus: null,
      activeSessionId: null,
      completedWorkSessions: 0,
      countdownSoundFired: false,
    });
  },

  resetToNextSessionType: () => {
    const {
      sessionType,
      focusMode,
      settings,
      reset,
      targetDuration: currentTargetDuration,
    } = get();

    if (focusMode === "custom") {
      reset();
      return {
        sessionType: "work",
        remainingTime: currentTargetDuration,
        targetDuration: currentTargetDuration,
      };
    }

    const preset = settings ? settings.presets[focusMode] : null;

    if (sessionType !== "work") {
      const workDurationMillis = preset
        ? minutesToMilliseconds(preset.work)
        : minutesToMilliseconds(DEFAULT_WORK_DURATION_MINUTES);

      set({
        sessionType: "work",
        remainingTime: workDurationMillis,
        targetDuration: workDurationMillis,
        isRunning: false,
        isPaused: false,
        countdownSoundFired: false,
      });
      return {
        sessionType: "work",
        remainingTime: workDurationMillis,
        targetDuration: workDurationMillis,
      };
    }

    const completedSessions = get().completedWorkSessions;

    const sessionsBeforeLongBreak = settings
      ? settings.sessionsBeforeLongBreak
      : 4;

    const isLongBreak = (completedSessions + 1) % sessionsBeforeLongBreak === 0;

    if (isLongBreak) {
      const longBreakDurationMillis = preset
        ? minutesToMilliseconds(preset.longBreak)
        : minutesToMilliseconds(DEFAULT_LONG_BREAK_MINUTES);

      set({
        sessionType: "longBreak",
        remainingTime: longBreakDurationMillis,
        targetDuration: longBreakDurationMillis,
        completedWorkSessions: 0,
        isRunning: false,
        isPaused: false,
        countdownSoundFired: false,
      });
      return {
        sessionType: "longBreak",
        remainingTime: longBreakDurationMillis,
        targetDuration: longBreakDurationMillis,
      };
    } else {
      const shortBreakDurationMillis = preset
        ? minutesToMilliseconds(preset.shortBreak)
        : minutesToMilliseconds(DEFAULT_SHORT_BREAK_MINUTES);
      set({
        sessionType: "shortBreak",
        remainingTime: shortBreakDurationMillis,
        targetDuration: shortBreakDurationMillis,
        completedWorkSessions: completedSessions + 1,
        isRunning: false,
        isPaused: false,
        countdownSoundFired: false,
      });
      return {
        sessionType: "shortBreak",
        remainingTime: shortBreakDurationMillis,
        targetDuration: shortBreakDurationMillis,
      };
    }
  },
}));

function minutesToMilliseconds(minutes: number): number {
  return minutes * 60 * 1000;
}
