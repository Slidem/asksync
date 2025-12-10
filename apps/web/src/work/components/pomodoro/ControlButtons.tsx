import { EndSession } from "@/work/components/pomodoro/EndSession";
import { PauseSession } from "@/work/components/pomodoro/PauseSession";
import { ResumeSession } from "@/work/components/pomodoro/ResumeSession";
import { SkipSession } from "@/work/components/pomodoro/SkipSession";
import { StartFocus } from "@/work/components/pomodoro/StartSession";
import { TakeBrake } from "@/work/components/pomodoro/TakeBrake";
import { useShallow } from "zustand/react/shallow";
import { useWorkModeStore } from "@/work/stores/workModeStore";

export const ControlButtons = () => {
  const { isRunning, isPaused, sessionType, canTakeBreak } = useWorkModeStore(
    useShallow((state) => ({
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      sessionType: state.sessionType,
      canTakeBreak: state.focusMode !== "custom",
    })),
  );

  if (!isRunning && !isPaused) {
    return <StartFocus />;
  }

  if (isPaused) {
    return (
      <div className="flex gap-4">
        <ResumeSession />
        <SkipSession />
      </div>
    );
  }

  if (sessionType === "work") {
    return (
      <div className="flex gap-4">
        <PauseSession />
        {canTakeBreak && <TakeBrake />}
        <EndSession />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <PauseSession />
      <SkipSession customText="Skip Break" />
      <EndSession />
    </div>
  );
};
