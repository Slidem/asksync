"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";
import { GroupNameInput } from "./GroupNameInput";
import { GroupDescriptionInput } from "./GroupDescriptionInput";
import { GroupColorPicker } from "./GroupColorPicker";
import { GroupDialogActions } from "./GroupDialogActions";

export function GroupDialog() {
  const isOpen = useGroupDialogStore((state) => state.isOpen);
  const close = useGroupDialogStore((state) => state.close);
  const groupId = useGroupDialogStore((state) => state.groupId);

  const isEditing = !!groupId;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Group" : "Create New Group"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the group details."
              : "Create a group to organize members and manage permissions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <GroupNameInput />
          <GroupDescriptionInput />
          <GroupColorPicker />
        </div>

        <DialogFooter>
          <GroupDialogActions />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
