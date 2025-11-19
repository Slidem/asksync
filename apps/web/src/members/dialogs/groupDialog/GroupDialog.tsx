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
import { Separator } from "@/components/ui/separator";
import { UsersRound } from "lucide-react";

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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <UsersRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Group" : "Create New Group"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update group details and settings"
                  : "Organize members with groups for easier permission management"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6 py-2">
          <GroupNameInput />
          <GroupDescriptionInput />
          <GroupColorPicker />
        </div>

        <Separator />

        <DialogFooter>
          <GroupDialogActions />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
