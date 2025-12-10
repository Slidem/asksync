"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import { Label } from "@/components/ui/label";
import { usePomodoroSettings } from "../hooks/usePomodoroSettings";
import { useState } from "react";

interface TakeBreakDialogProps {
  onTakeBreak: (breakType: "shortBreak" | "longBreak") => void;
}

export function TakeBreakDialog({ onTakeBreak }: TakeBreakDialogProps) {
  const [open, setOpen] = useState(false);
  const [breakType, setBreakType] = useState<"shortBreak" | "longBreak">(
    "shortBreak",
  );
  const settings = usePomodoroSettings();

  const handleTakeBreak = () => {
    onTakeBreak(breakType);
    setOpen(false);
  };

  if (!settings || settings.currentFocusMode === "custom") {
    return null;
  }

  const shortBreakDuration =
    settings?.presets[settings.currentFocusMode]?.shortBreak ||
    settings?.defaultShortBreak ||
    5;

  const longBreakDuration =
    settings?.presets[settings.currentFocusMode]?.longBreak ||
    settings?.defaultLongBreak ||
    15;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="secondary"
          className="px-6 py-6 text-lg font-semibold hover:scale-105 transition-all"
        >
          <Coffee className="mr-2 h-6 w-6" />
          Take Break
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Take a Break</DialogTitle>
          <DialogDescription>
            Choose the length of your break. Your work session will end and you
            can resume later.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={breakType}
          onValueChange={(value) =>
            setBreakType(value as "shortBreak" | "longBreak")
          }
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
            <RadioGroupItem value="shortBreak" id="short" />
            <Label htmlFor="short" className="flex-1 cursor-pointer">
              <div className="font-medium">Short Break</div>
              <div className="text-sm text-muted-foreground">
                {shortBreakDuration} minutes
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
            <RadioGroupItem value="longBreak" id="long" />
            <Label htmlFor="long" className="flex-1 cursor-pointer">
              <div className="font-medium">Long Break</div>
              <div className="text-sm text-muted-foreground">
                {longBreakDuration} minutes
              </div>
            </Label>
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleTakeBreak}>Start Break</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
