"use client";

import { useMemo, useState } from "react";

import { EmailItem } from "@/work/types";
import { EmailViewerDialog } from "@/emails/components/EmailViewerDialog";
import { EmailsPanel } from "@/work/components/focusPanel/EmailsPanel";
import { useCurrentTimeblock } from "@/work/hooks/useCurrentTimeblock";
import { useTimeblockAttentionItems } from "@/emails/hooks/useTimeblockAttentionItems";

export function FocusPanelEmails(): React.ReactNode {
  const { timeblockData } = useCurrentTimeblock();
  const timeblockIds = useMemo(
    () => timeblockData?.timeblocks.map((tb) => tb._id) ?? [],
    [timeblockData?.timeblocks],
  );
  const { items, isLoading } = useTimeblockAttentionItems(timeblockIds);
  const [selectedItem, setSelectedItem] = useState<EmailItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <EmailsPanel
        items={items}
        onViewEmail={(item) => setSelectedItem(item)}
      />
      <EmailViewerDialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        item={selectedItem}
      />
    </>
  );
}
