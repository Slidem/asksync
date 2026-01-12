import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { DurationControl } from "./DurationControl";
import { PomodoroSettings } from "@/work/types";

interface PresetEditorProps {
  settings: PomodoroSettings;
  onUpdate: (settings: Partial<PomodoroSettings>) => void;
}

const PRESET_LABELS: Record<keyof PomodoroSettings["presets"], string> = {
  deep: "Deep Work",
  normal: "Normal",
  quick: "Quick",
  review: "Review",
};

const PRESET_DESCRIPTIONS: Record<keyof PomodoroSettings["presets"], string> = {
  deep: "Long focused sessions for complex work",
  normal: "Standard Pomodoro technique",
  quick: "Short bursts for simple tasks",
  review: "Medium sessions for reviewing and planning",
};

const DEFAULT_PRESETS: PomodoroSettings["presets"] = {
  deep: { work: 90, shortBreak: 15, longBreak: 30 },
  normal: { work: 25, shortBreak: 5, longBreak: 15 },
  quick: { work: 15, shortBreak: 3, longBreak: 10 },
  review: { work: 45, shortBreak: 10, longBreak: 20 },
};

export function PresetEditor({
  settings,
  onUpdate,
}: PresetEditorProps): React.ReactNode {
  const handlePresetChange = (
    presetName: keyof PomodoroSettings["presets"],
    field: "work" | "shortBreak" | "longBreak",
    value: number,
  ) => {
    onUpdate({
      presets: {
        ...settings.presets,
        [presetName]: {
          ...settings.presets[presetName],
          [field]: value,
        },
      },
    });
  };

  const handleResetToDefaults = () => {
    onUpdate({
      presets: DEFAULT_PRESETS,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Focus Mode Presets</CardTitle>
            <CardDescription>
              Customize durations for each focus mode
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetToDefaults}>
            Reset to Defaults
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(
          Object.keys(PRESET_LABELS) as Array<keyof PomodoroSettings["presets"]>
        ).map((presetName) => (
          <div key={presetName} className="space-y-4">
            <div>
              <h4 className="font-medium">{PRESET_LABELS[presetName]}</h4>
              <p className="text-sm text-muted-foreground">
                {PRESET_DESCRIPTIONS[presetName]}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <DurationControl
                label="Work"
                value={settings.presets[presetName].work}
                onChange={(value) =>
                  handlePresetChange(presetName, "work", value)
                }
                min={1}
                max={180}
              />
              <DurationControl
                label="Short Break"
                value={settings.presets[presetName].shortBreak}
                onChange={(value) =>
                  handlePresetChange(presetName, "shortBreak", value)
                }
                min={1}
                max={60}
              />
              <DurationControl
                label="Long Break"
                value={settings.presets[presetName].longBreak}
                onChange={(value) =>
                  handlePresetChange(presetName, "longBreak", value)
                }
                min={1}
                max={90}
              />
            </div>
            {presetName !== "review" && <div className="border-b" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
