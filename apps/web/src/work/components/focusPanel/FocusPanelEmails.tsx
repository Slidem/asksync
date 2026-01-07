"use client";

import { useMemo, useState } from "react";

import { EmailViewerDialog } from "@/emails/components/EmailViewerDialog";
import { useTimeblockAttentionItems } from "@/emails/hooks/useTimeblockAttentionItems";
import { useCurrentTimeblock } from "@/work/hooks/useCurrentTimeblock";
import { EmailsPanel } from "@/work/components/focusPanel/EmailsPanel";

export function FocusPanelEmails() {
  const { timeblockData } = useCurrentTimeblock();
  const timeblockIds = useMemo(
    () => timeblockData?.timeblocks.map((tb) => tb._id) ?? [],
    [timeblockData?.timeblocks],
  );
  const { items, isLoading } = useTimeblockAttentionItems(timeblockIds);
  const [selectedItem, setSelectedItem] = useState<(typeof items)[0] | null>(
    null,
  );

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
