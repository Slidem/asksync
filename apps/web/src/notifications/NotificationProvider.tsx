"use client";

import { usePendingItemNotifications } from "@/notifications/hooks/usePendingItemNotifications";

/**
 * Provider component that enables pending item notifications.
 * Add this to your authenticated layout to start listening for new items.
 */
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  usePendingItemNotifications();
  return <>{children}</>;
}
