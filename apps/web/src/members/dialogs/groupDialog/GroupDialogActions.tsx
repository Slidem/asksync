import { Button } from "@/components/ui/button";
import { api } from "@convex/api";
import { toGroupId } from "@/lib/convexTypes";
import { toast } from "sonner";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";
import { useMutation } from "convex/react";
import { useShallow } from "zustand/react/shallow";

export function GroupDialogActions(): React.ReactNode {
  const {
    close,
    reset,
    groupId,
    name,
    description,
    color,
    isSubmitting,
    setIsSubmitting,
  } = useGroupDialogStore(
    useShallow((state) => ({
      close: state.close,
      reset: state.reset,
      groupId: state.groupId,
      name: state.name,
      description: state.description,
      color: state.color,
      isSubmitting: state.isSubmitting,
      setIsSubmitting: state.setIsSubmitting,
    })),
  );

  const createGroup = useMutation(api.groups.mutations.createGroup);
  const updateGroup = useMutation(api.groups.mutations.updateGroup);

  const isEditing = !!groupId;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && groupId) {
        await updateGroup({
          groupId: toGroupId(groupId),
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
      } else {
        await createGroup({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
      }

      reset();
    } catch (error) {
      console.error(
        `Failed to ${isEditing ? "update" : "create"} group:`,
        error,
      );
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} group. Please try again.`,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => close()}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!name.trim() || isSubmitting}
      >
        {isSubmitting
          ? isEditing
            ? "Updating..."
            : "Creating..."
          : isEditing
            ? "Update Group"
            : "Create Group"}
      </Button>
    </>
  );
}
