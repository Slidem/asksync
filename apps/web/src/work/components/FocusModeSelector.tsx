"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { FocusMode } from "../types";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "../stores/workModeStore";

const focusModes: { value: FocusMode; label: string; description: string }[] = [
  { value: "deep", label: "Deep Work", description: "90 min sessions" },
  { value: "normal", label: "Normal", description: "25 min Pomodoro" },
  { value: "quick", label: "Quick", description: "15 min bursts" },
  { value: "review", label: "Review", description: "45 min sessions" },
  { value: "custom", label: "Custom", description: "Set your own" },
];

/**
 * Focus mode selector dropdown component
 */
export const FocusModeSelector = memo(function FocusModeSelector() {
  const { focusMode, isRunning, setFocusMode } = useWorkModeStore(
    useShallow((state) => ({
      focusMode: state.focusMode,
      isRunning: state.isRunning,
      setFocusMode: state.setFocusMode,
    })),
  );

  const currentMode = focusModes.find((m) => m.value === focusMode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isRunning}
          className="min-w-[140px]"
        >
          {currentMode?.label || "Select Mode"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[200px]">
        {focusModes.map((mode) => (
          <DropdownMenuItem
            key={mode.value}
            onClick={() => setFocusMode(mode.value)}
            className="flex flex-col items-start py-2"
          >
            <div className="font-medium">{mode.label}</div>
            <div className="text-xs text-muted-foreground">
              {mode.description}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
