"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PomodoroSettings } from "@/work/types";
import { TimerNotificationSettings } from "@/settings/components/NotificationSettings";
import { api } from "@convex/api";
import { useMutation } from "convex/react";
import { usePomodoroSettings } from "@/work/hooks/usePomodoroSettings";
import { useToast } from "@/hooks/use-toast";

export function NotificationsTab(): React.ReactNode {
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
        description: "Your notification settings have been updated.",
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
          <h2 className="text-xl font-semibold">Notification Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how and when you receive alerts
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
        {/* Timer Notifications */}
        <TimerNotificationSettings
          settings={localSettings}
          onUpdate={handleUpdate}
        />

        {/* Tag-based Notifications Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tag Notifications</CardTitle>
            <CardDescription>
              Alerts for new questions or emails based on their tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enable notifications on specific tags to be alerted when new
              pending items arrive. For scheduled tags, notifications only
              trigger during active timeblocks. For on-demand tags, you&apos;ll
              be notified immediately.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/tags">Configure Tags</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
