"use client";

import { ChevronDown, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FocusMode } from "../../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/../../backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useShallow } from "zustand/react/shallow";
import { useToast } from "@/hooks/use-toast";
import { useWorkModeStore } from "../../stores/workModeStore";

const focusModeLabels: Record<Exclude<FocusMode, "custom">, string> = {
  deep: "Deep Work",
  normal: "Normal",
  quick: "Quick",
  review: "Review",
};

interface FocusModeSelectorProps {
  compact?: boolean;
}

/**
 * Focus mode selector dropdown component with custom duration support
 */
export const FocusModeSelector = memo(function FocusModeSelector({
  compact = false,
}: FocusModeSelectorProps) {
  const { toast } = useToast();
  const updateSettings = useMutation(
    api.workSessions.mutations.settings.updatePomodoroSettings,
  );

  const { focusMode, isRunning, settings, setFocusMode, setTargetDuration } =
    useWorkModeStore(
      useShallow((state) => ({
        focusMode: state.focusMode,
        isRunning: state.isRunning,
        settings: state.settings,
        setFocusMode: state.setFocusMode,
        setTargetDuration: state.setTargetDuration,
      })),
    );

  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [saveAsPreset, setSaveAsPreset] = useState(false);

  // Generate focus modes with dynamic descriptions from settings
  const focusModes = settings
    ? [
        {
          value: "deep" as const,
          label: focusModeLabels.deep,
          description: `${settings.presets.deep.work} min sessions`,
        },
        {
          value: "normal" as const,
          label: focusModeLabels.normal,
          description: `${settings.presets.normal.work} min Pomodoro`,
        },
        {
          value: "quick" as const,
          label: focusModeLabels.quick,
          description: `${settings.presets.quick.work} min bursts`,
        },
        {
          value: "review" as const,
          label: focusModeLabels.review,
          description: `${settings.presets.review.work} min sessions`,
        },
      ]
    : [];

  const currentMode = focusModes.find((m) => m.value === focusMode);

  const handleCustomClick = () => {
    setShowCustomDialog(true);
    // Pre-fill with current duration if in custom mode
    if (focusMode === "custom" && settings) {
      const currentMinutes = Math.round(settings.defaultWorkDuration || 30);
      setCustomMinutes(currentMinutes);
    }
  };

  const handleApplyCustom = async () => {
    if (customMinutes < 1 || customMinutes > 180) {
      toast({
        title: "Invalid duration",
        description: "Duration must be between 1 and 180 minutes.",
        variant: "destructive",
      });
      return;
    }

    const durationMs = customMinutes * 60 * 1000;

    if (saveAsPreset && settings) {
      // Save to user settings
      try {
        await updateSettings({
          ...settings,
          defaultWorkDuration: customMinutes,
          currentFocusMode: "custom",
        });
        toast({
          title: "Custom duration saved",
          description: `Saved ${customMinutes} minutes as your custom preset.`,
        });
      } catch (error) {
        console.error("Error saving custom duration:", error);
        toast({
          title: "Error saving",
          description: "Failed to save custom duration. Please try again.",
          variant: "destructive",
        });
      }
    }

    // Apply to current session (one-time or from saved preset)
    setTargetDuration(durationMs);
    setFocusMode("custom");
    setShowCustomDialog(false);
    setSaveAsPreset(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={compact ? "ghost" : "outline"}
            size="sm"
            disabled={isRunning}
            className={compact ? "h-8 px-2 gap-1" : "min-w-[140px]"}
          >
            {currentMode?.label || "Custom"}
            <ChevronDown className={compact ? "h-3 w-3" : "ml-2 h-4 w-4"} />
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleCustomClick}
            className="flex flex-col items-start py-2"
          >
            <div className="font-medium">Custom</div>
            <div className="text-xs text-muted-foreground">
              Set your own duration
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Duration</DialogTitle>
            <DialogDescription>
              Set a custom work session duration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-duration">Duration (minutes)</Label>
              <Input
                id="custom-duration"
                type="number"
                min={1}
                max={180}
                value={customMinutes}
                onChange={(e) =>
                  setCustomMinutes(parseInt(e.target.value) || 30)
                }
              />
              <p className="text-sm text-muted-foreground">
                Between 1 and 180 minutes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="save-preset"
                checked={saveAsPreset}
                onChange={(e) => setSaveAsPreset(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="save-preset" className="cursor-pointer">
                Save as my custom preset
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyCustom}>
              {saveAsPreset && <Save className="mr-2 h-4 w-4" />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
