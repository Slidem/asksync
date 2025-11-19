import React from "react";
import { Tag } from "@asksync/shared";
import { TagFormData } from "@/tags/model";
import TagFormDialog from "@/tags/components/dialog/TagDialog";
import { useSyncPermissions } from "@/components/permissions";
import { useUpdateTag } from "@/tags/hooks/mutations";

interface Props {
  tag: Tag | null;
  onOpenChange: (open: boolean) => void;
}

export const UpdateTagDialog: React.FC<Props> = ({ tag, onOpenChange }) => {
  const { updateTag, isUpdating } = useUpdateTag();
  const syncPermissions = useSyncPermissions();
  const handleSubmit = async (data: TagFormData) => {
    if (!tag) return;
    const { permissions: newPermissions, ...updateData } = data;
    await updateTag(tag.id, updateData);
    if (newPermissions) {
      await syncPermissions("tags", tag.id, tag.permissions, newPermissions);
    }

    onOpenChange(false);
  };

  if (!tag) return null;

  return (
    <TagFormDialog
      open={!!tag}
      title="Edit Tag"
      description="Update the tag details and availability settings."
      loadingText="Updating..."
      submitButtonText="Update Tag"
      isLoading={isUpdating}
      isCreating={false}
      defaultValues={tag}
      onSubmit={handleSubmit}
      onOpenChange={onOpenChange}
    />
  );
};
