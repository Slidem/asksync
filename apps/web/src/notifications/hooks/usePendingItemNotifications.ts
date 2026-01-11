"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useRef } from "react";

import { api } from "@convex/api";
import { canShowNotifications, showNotification } from "@/work/utils/notifications";
import { playAlarmSound } from "@/work/sound";

/**
 * Hook that watches for new pending items and triggers browser/sound notifications.
 * Uses Convex reactive queries to detect new items.
 */
export function usePendingItemNotifications() {
  const pendingItems = useQuery(api.notifications.queries.getPendingItemsForNotification);
  const markQuestionsNotified = useMutation(api.questions.mutations.markAsNotified);
  const markEmailItemsNotified = useMutation(api.gmail.mutations.markItemsAsNotified);

  // Track previous item IDs to detect truly new items
  const prevItemIdsRef = useRef<Set<string>>(new Set());
  const isProcessingRef = useRef(false);

  const processNotifications = useCallback(async () => {
    if (!pendingItems || isProcessingRef.current) return;

    const { questions, emailItems } = pendingItems;
    const allItems = [...questions, ...emailItems];

    if (allItems.length === 0) {
      prevItemIdsRef.current = new Set();
      return;
    }

    // Build current IDs set
    const currentIds = new Set(allItems.map((i) => i._id));

    // Find items that are new (not seen before)
    const newItems = allItems.filter(
      (item) => !prevItemIdsRef.current.has(item._id),
    );

    // Update ref for next check
    prevItemIdsRef.current = currentIds;

    if (newItems.length === 0) return;

    // Mark as processing to prevent duplicate notifications
    isProcessingRef.current = true;

    try {
      // Determine what notifications to show
      const shouldBrowser =
        newItems.some((i) => i.browser) && canShowNotifications();
      const shouldSound = newItems.some((i) => i.sound);

      // Show browser notification
      if (shouldBrowser) {
        const questionCount = questions.filter((q) =>
          newItems.some((n) => n._id === q._id),
        ).length;
        const emailCount = emailItems.filter((e) =>
          newItems.some((n) => n._id === e._id),
        ).length;

        let title: string;
        let body: string;

        if (newItems.length === 1) {
          const item = newItems[0];
          if ("title" in item) {
            title = "New Question";
            body = item.title;
          } else {
            title = `Email from ${item.senderName}`;
            body = item.subject;
          }
        } else {
          title = `${newItems.length} Items Need Attention`;
          const parts: string[] = [];
          if (questionCount > 0) parts.push(`${questionCount} question${questionCount > 1 ? "s" : ""}`);
          if (emailCount > 0) parts.push(`${emailCount} email${emailCount > 1 ? "s" : ""}`);
          body = parts.join(", ");
        }

        showNotification({
          title,
          body,
          tag: "asksync-pending-items",
        });
      }

      // Play sound once for all new items
      if (shouldSound) {
        playAlarmSound();
      }

      // Mark all items as notified
      const questionIds = questions.map((q) => q._id);
      const emailItemIds = emailItems.map((i) => i._id);

      if (questionIds.length > 0) {
        await markQuestionsNotified({ questionIds });
      }
      if (emailItemIds.length > 0) {
        await markEmailItemsNotified({ itemIds: emailItemIds });
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [pendingItems, markQuestionsNotified, markEmailItemsNotified]);

  // Process whenever pendingItems changes
  // This runs on every render when pendingItems updates, but useCallback + refs prevent duplicate work
  if (pendingItems) {
    processNotifications();
  }
}
