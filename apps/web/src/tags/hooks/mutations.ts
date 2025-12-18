import {
  CreateTagForm,
  PermissionGrant,
  Tag,
  UpdateTagForm,
} from "@asksync/shared";
import { useConvex, useMutation } from "convex/react";

import React from "react";
import { api } from "@convex/api";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { toTagId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useSyncPermissions } from "@/components/permissions";

interface TagUsageData {
  questions: Array<{ _id: string; title: string }>;
  timeblocks: Array<{
    _id: string;
    title: string;
    startTime: number;
    endTime: number;
  }>;
  totalQuestions: number;
  totalTimeblocks: number;
}

export const useCreateTag = () => {
  const [isCreating, setIsCreating] = React.useState(false);
  const createTagMutation = useMutation(api.tags.mutations.createTag);
  const syncPermissions = useSyncPermissions();
  const createTag = async (
    data: CreateTagForm & { permissions?: PermissionGrant[] },
  ) => {
    try {
      setIsCreating(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { permissions: _, ...tagData } = data;
      const tagId = await createTagMutation({ ...tagData });
      if (data.permissions) {
        await syncPermissions("tags", tagId, [], data.permissions);
      }
      toast.success("Tag created successfully");
      return tagId;
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
  const convex = useConvex();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [usageDialogState, setUsageDialogState] = React.useState<{
    open: boolean;
    tagName: string;
    usage: TagUsageData | null;
  }>({
    open: false,
    tagName: "",
    usage: null,
  });

  const deleteTag = async (tag: Tag) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      // Check usage first
      const usage = await convex.query(api.tags.queries.getTagUsage, {
        tagId: toTagId(tag.id),
      });

      if (usage.totalQuestions > 0 || usage.totalTimeblocks > 0) {
        // Show usage dialog
        setUsageDialogState({
          open: true,
          tagName: tag.name,
          usage,
        });
      } else {
        // Tag not in use, show regular confirm dialog
        confirmDialog.show({
          title: "Delete tag",
          description: `Are you sure you want to delete the tag "${tag.name}"?`,
          onConfirm: async () => {
            try {
              await deleteTagMutation({ id: toTagId(tag.id) });
              toast.success("Tag deleted successfully");
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to delete tag",
              );
            }
          },
        });
      }
    } catch (error) {
      console.error("Error checking tag usage:", error);
      toast.error("Failed to check tag usage");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeUsageDialog = () => {
    setUsageDialogState({
      open: false,
      tagName: "",
      usage: null,
    });
  };

  return {
    deleteTag,
    isDeleting,
    usageDialogState,
    closeUsageDialog,
  };
};
