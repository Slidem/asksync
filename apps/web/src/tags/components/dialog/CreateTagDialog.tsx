import React from "react";
import { TagFormData } from "@/tags/model";
import TagFormDialog from "@/tags/components/dialog/TagDialog";
import { useCreateTag } from "@/tags/hooks/mutations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTagDialog: React.FC<Props> = ({
  open,
  onOpenChange: setOpen,
}) => {
  const { createTag, isCreating } = useCreateTag();

  const handleSubmit = async (data: TagFormData) => {
    await createTag(data);
    setOpen(false);
  };

  return (
    <TagFormDialog
      open={open}
      title="Create New Tag"
      description="Tags help categorize questions and define availability windows."
      loadingText="Creating..."
      submitButtonText="Create Tag"
      isLoading={isCreating}
      onSubmit={handleSubmit}
      onOpenChange={setOpen}
    />
  );
};
