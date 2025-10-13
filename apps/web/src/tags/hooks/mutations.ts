import { CreateTagForm, Tag, UpdateTagForm } from "@asksync/shared";

import React from "react";
import { api } from "@convex/api";
import { toTagId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useMutation } from "convex/react";

export const useCreateTag = () => {
  const [isCreating, setIsCreating] = React.useState(false);
  const createTagMutation = useMutation(api.tags.mutations.createTag);
  const createTag = async (data: CreateTagForm) => {
    try {
      setIsCreating(true);
      await createTagMutation(data);
      toast.success("Tag created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create tag",
      );
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  return { createTag, isCreating };
};

export const useUpdateTag = () => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const updateTagMutation = useMutation(api.tags.mutations.updateTag);
  const updateTag = async (tagId: string, data: UpdateTagForm) => {
    try {
      setIsUpdating(true);
      await updateTagMutation({ id: toTagId(tagId), ...data });
      toast.success("Tag updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update tag",
      );
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTag, isUpdating };
};

export const useDeleteTag = () => {
  const deleteTagMutation = useMutation(api.tags.mutations.deleteTag);
  const deleteTag = async (tag: Tag) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      return;
    }

    try {
      await deleteTagMutation({ id: toTagId(tag.id) });
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete tag",
      );
    }
  };
  return { deleteTag };
};
