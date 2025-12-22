/**
 * Chrome notification utilities for work mode timer
 */

export type NotificationPermission = "granted" | "denied" | "default";

/**
 * Request notification permission from browser
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("Browser doesn't support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission as NotificationPermission;
}

/**
 * Check if notifications are supported and permitted
 */
export function canShowNotifications(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

interface ShowNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Show browser notification
 */
export function showNotification(options: ShowNotificationOptions): void {
  if (!canShowNotifications()) {
    console.log("Notifications not available or not permitted");
    return;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/favicon.ico",
      tag: options.tag || "asksync-work-mode",
      requireInteraction: options.requireInteraction ?? false,
      badge: "/favicon.ico",
    });

    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

/**
 * Show work session complete notification
 */
export function notifyWorkComplete(): void {
  showNotification({
    title: "Work Session Complete! 🎉",
    body: "Great job! Time for a break.",
    tag: "work-complete",
    requireInteraction: false,
  });
}

/**
 * Show break complete notification
 */
export function notifyBreakComplete(isLongBreak: boolean = false): void {
  showNotification({
    title: isLongBreak ? "Long Break Over 💪" : "Break Over ⏰",
    body: "Ready to get back to work?",
    tag: "break-complete",
    requireInteraction: false,
  });
}

/**
 * Test notification (for settings preview)
 */
export function showTestNotification(): void {
  showNotification({
    title: "Test Notification ✅",
    body: "Notifications are working! You'll see these when your timer completes.",
    tag: "test-notification",
    requireInteraction: false,
  });
}
