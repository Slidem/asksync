import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coffee, PlayCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { PomodoroSettings } from "@/work/types";
import { Switch } from "@/components/ui/switch";

interface AutomationSettingsProps {
  settings: PomodoroSettings;
  onUpdate: (settings: Partial<PomodoroSettings>) => void;
}

export function AutomationSettings({
  settings,
  onUpdate,
}: AutomationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation</CardTitle>
        <CardDescription>
          Configure automatic session transitions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              <Label htmlFor="auto-start-breaks">Auto-start Breaks</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically start break timer when work session completes
            </p>
          </div>
          <Switch
            id="auto-start-breaks"
            checked={settings.autoStartBreaks}
            onCheckedChange={(enabled) =>
              onUpdate({ autoStartBreaks: enabled })
            }
          />
        </div>

        <div className="border-b" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <Label htmlFor="auto-start-work">Auto-start Work Sessions</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically start work timer when break completes
            </p>
          </div>
          <Switch
            id="auto-start-work"
            checked={settings.autoStartWork}
            onCheckedChange={(enabled) => onUpdate({ autoStartWork: enabled })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
