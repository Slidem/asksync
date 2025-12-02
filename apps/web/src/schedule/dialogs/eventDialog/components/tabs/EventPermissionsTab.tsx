"use client";

import React from "react";
import { ResourcePermissionsManager } from "@/components/permissions";
import { useEventDialogStore } from "@/schedule/dialogs/eventDialog/eventDialogStore";
import { useShallow } from "zustand/react/shallow";

export const EventPermissionsTab = React.memo(() => {
  const { permissions, setPermissions, eventId } = useEventDialogStore(
    useShallow((state) => ({
      permissions: state.formFields.permissions,
      setPermissions: state.setPermissions,
      eventId: state.eventMetadata.eventId,
    })),
  );

  return (
    <div className="space-y-4">
      <ResourcePermissionsManager
        grants={permissions}
        canEdit={true}
        isCreating={!eventId}
        onChange={setPermissions}
      />
    </div>
  );
});

EventPermissionsTab.displayName = "EventPermissionsTab";
