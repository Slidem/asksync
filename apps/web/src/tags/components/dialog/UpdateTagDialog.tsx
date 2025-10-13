import React from "react";
import { Tag } from "@asksync/shared";
import { TagFormData } from "@/tags/model";
import TagFormDialog from "@/tags/components/dialog/TagDialog";
import { useUpdateTag } from "@/tags/hooks/mutations";

interface Props {
  tag: Tag | null;
  onOpenChange: (open: boolean) => void;
}

export const UpdateTagDialog: React.FC<Props> = ({ tag, onOpenChange }) => {
  const { updateTag, isUpdating } = useUpdateTag();

  const handleSubmit = async (data: TagFormData) => {
    if (!tag) return;
    await updateTag(tag.id, data);
    onOpenChange(false);
  };

  return (
    <TagFormDialog
      open={!!tag}
      title="Edit Tag"
      description="Update the tag details and availability settings."
      loadingText="Updating..."
      submitButtonText="Update Tag"
      isLoading={isUpdating}
      defaultValues={tag || undefined}
      onSubmit={handleSubmit}
      onOpenChange={onOpenChange}
    />
  );
};
