"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bell, BellOff, Volume2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showTestNotification,
} from "@/work/utils/notifications";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PomodoroSettings } from "@/work/types";
import { Switch } from "@/components/ui/switch";

interface TimerNotificationSettingsProps {
  settings: PomodoroSettings;
  onUpdate: (settings: Partial<PomodoroSettings>) => void;
}

/**
 * Timer notification settings - browser/sound alerts for work timer completion
 */
export function TimerNotificationSettings({
  settings,
  onUpdate,
}: TimerNotificationSettingsProps) {
  const [notificationPermission, setNotificationPermission] =
    useState<string>("default");

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      onUpdate({ notificationsEnabled: true });
    }
  };

  const handleTestNotification = () => {
    showTestNotification();
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    if (enabled && notificationPermission !== "granted") {
      handleRequestPermission();
    } else {
      onUpdate({ notificationsEnabled: enabled });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer Notifications</CardTitle>
        <CardDescription>
          Alerts when your focus timer completes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Browser Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="browser-notifications">
                  Browser Notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Show desktop notifications when timer completes
              </p>
            </div>
            <Switch
              id="browser-notifications"
              checked={settings.notificationsEnabled}
              onCheckedChange={handleNotificationsToggle}
              disabled={notificationPermission === "denied"}
            />
          </div>

          {/* Permission Status */}
          {notificationPermission === "denied" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Notifications are blocked. Please enable them in your browser
                settings.
              </AlertDescription>
            </Alert>
          )}

          {notificationPermission === "default" && (
            <Alert>
              <BellOff className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Click the switch above to enable notifications</span>
              </AlertDescription>
            </Alert>
          )}

          {notificationPermission === "granted" &&
            settings.notificationsEnabled && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                >
                  Test Notification
                </Button>
              </div>
            )}
        </div>

        <div className="border-b" />

        {/* Sound Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Label htmlFor="sound-notifications">Sound Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Play a sound when timer completes
            </p>
          </div>
          <Switch
            id="sound-notifications"
            checked={settings.soundEnabled}
            onCheckedChange={(enabled) => onUpdate({ soundEnabled: enabled })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
