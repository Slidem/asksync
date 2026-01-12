import { EmailTag } from "@/work/components/focusPanel/EmailsPanel";
import { Id } from "@/../../backend/convex/_generated/dataModel";

export type SessionType = "work" | "shortBreak" | "longBreak";
export type SessionStatus = "active" | "paused" | "completed" | "skipped";
export type FocusMode = "deep" | "normal" | "quick" | "review" | "custom";

export interface WorkSession {
  _id: Id<"workSessions">;
  userId: string;
  orgId: string;
  sessionType: SessionType;
  timeblockId?: Id<"timeblocks">;
  taskId?: Id<"tasks">;
  questionId?: Id<"questions">;
  startedAt: number;
  endedAt?: number;
  pausedDuration: number;
  targetDuration: number;
  actualDuration: number;
  focusMode: FocusMode;
  customDuration?: number;
  tasksCompleted: Id<"tasks">[];
  questionsAnswered: Id<"questions">[];
  status: SessionStatus;
  deviceId: string;
  createdAt: number;
  updatedAt: number;
}

export interface PomodoroSettings {
  defaultWorkDuration: number;
  defaultShortBreak: number;
  defaultLongBreak: number;
  sessionsBeforeLongBreak: number;
  presets: {
    deep: { work: number; shortBreak: number; longBreak: number };
    normal: { work: number; shortBreak: number; longBreak: number };
    quick: { work: number; shortBreak: number; longBreak: number };
    review: { work: number; shortBreak: number; longBreak: number };
  };
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  currentFocusMode: FocusMode;
}

export interface SessionStats {
  totalSessions: number;
  totalFocusTime: number;
  totalTasks: number;
  totalQuestions: number;
  currentStreak: number;
}
export const DEFAULT_WORK_DURATION_MINUTES = 25;
export const DEFAULT_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 15;
export interface EmailItem {
  _id: Id<"emailAttentionItems">;
  senderEmail: string;
  senderName?: string;
  subject: string;
  snippet: string;
  htmlBody?: string;
  receivedAt: number;
  expectedAnswerTime: number;
  isOverdue: boolean;
  status: "pending" | "resolved";
  sourceEmail: string;
  tags: EmailTag[];
}
