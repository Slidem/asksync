"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PresetEditor } from "@/work/components/settings/PresetEditor";
import { NotificationSettings } from "@/work/components/settings/NotificationSettings";
import { AutomationSettings } from "@/work/components/settings/AutomationSettings";
import { usePomodoroSettings } from "@/work/hooks/usePomodoroSettings";
import { useMutation } from "convex/react";
import { api } from "@/../../backend/convex/_generated/api";
import { PomodoroSettings } from "@/work/types";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WorkModeSettings() {
  const { toast } = useToast();
  const settings = usePomodoroSettings();
  const updateSettings = useMutation(
    api.workSessions.mutations.settings.updatePomodoroSettings,
  );

  const [localSettings, setLocalSettings] = useState<PomodoroSettings | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  const handleUpdate = (updates: Partial<PomodoroSettings>) => {
    if (localSettings) {
      setLocalSettings({ ...localSettings, ...updates });
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    try {
      // Filter out Convex system fields before sending
      const {
        defaultWorkDuration,
        defaultShortBreak,
        defaultLongBreak,
        sessionsBeforeLongBreak,
        presets,
        autoStartBreaks,
        autoStartWork,
        soundEnabled,
        notificationsEnabled,
        currentFocusMode,
      } = localSettings;

      await updateSettings({
        defaultWorkDuration,
        defaultShortBreak,
        defaultLongBreak,
        sessionsBeforeLongBreak,
        presets,
        autoStartBreaks,
        autoStartWork,
        soundEnabled,
        notificationsEnabled,
        currentFocusMode,
      });

      setHasChanges(false);
      toast({
        title: "Settings saved",
        description: "Your work mode settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  };

  if (!localSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Work Mode Preferences</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your focus timer durations and notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <PresetEditor settings={localSettings} onUpdate={handleUpdate} />
        <NotificationSettings settings={localSettings} onUpdate={handleUpdate} />
        <AutomationSettings settings={localSettings} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
