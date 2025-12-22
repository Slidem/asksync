"use client";

import { memo } from "react";

interface CircularProgressProps {
  progress: number;
  sessionType: string;
  isRunning: boolean;
  children: React.ReactNode;
}

const DEFAULT_COLORS = {
  start: "stop-color-gray-500",
  end: "stop-color-gray-600",
};

const SESSION_TYPE_COLORS: Record<string, { start: string; end: string }> = {
  work: {
    start: "stop-color-blue-500",
    end: "stop-color-purple-600",
  },
  shortBreak: {
    start: "stop-color-green-500",
    end: "stop-color-emerald-600",
  },
  longBreak: {
    start: "stop-color-orange-500",
    end: "stop-color-amber-600",
  },
};

/**
 * Circular progress ring component for the timer
 */
export const CircularProgress = memo(function CircularProgress({
  progress,
  sessionType,
  children,
}: CircularProgressProps) {
  const colors = SESSION_TYPE_COLORS[sessionType] || DEFAULT_COLORS;
  const viewBoxSize = 500;
  const radius = 220;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);
  const strokeWidth = 18;
  const center = viewBoxSize / 2;

  return (
    <div className="relative w-96 h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem]">
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={colors.start} />
            <stop offset="100%" className={colors.end} />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
});
