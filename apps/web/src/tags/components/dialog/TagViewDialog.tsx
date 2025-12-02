import {
  AnswerMode,
  Color,
  Description,
  Name,
  ResponseTime,
} from "./TagFormFields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TagFormData, tagFormSchema } from "@/tags/model";
import {
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/ui/UnderlineTabs";

import { AskQuestionFromTag } from "@/questions/components/AskQuestionFromTag";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ResourcePermissionsManager } from "@/components/permissions";
import { Separator } from "@/components/ui/separator";
import { Tag } from "@asksync/shared";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSyncPermissions } from "@/components/permissions";
import { useUpdateTag } from "@/tags/hooks/mutations";
import { zodResolver } from "@hookform/resolvers/zod";

interface TagViewDialogProps {
  tag: Tag | null;
  onOpenChange: (open: boolean) => void;
}

export const TagViewDialog: React.FC<TagViewDialogProps> = ({
  tag,
  onOpenChange,
}) => {
  const { updateTag, isUpdating } = useUpdateTag();
  const syncPermissions = useSyncPermissions();

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: tag || undefined,
  });

  useEffect(() => {
    if (tag) {
      form.reset(tag);
    }
  }, [tag, form]);

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

  const canEdit = tag.canEdit || tag.canManage;
  const isShared = tag.permissions.some((p) => !p.isCreator);

  // If can't edit and not shared, don't show anything
  if (!canEdit && !isShared) {
    return null;
  }

  // If can't edit but is shared, show only ask question
  if (!canEdit && isShared) {
    return (
      <Dialog open={!!tag} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
            <DialogDescription>
              Create a question with the {tag.name} tag
            </DialogDescription>
          </DialogHeader>
          <AskQuestionFromTag tag={tag} />
        </DialogContent>
      </Dialog>
    );
  }

  // If can edit and is shared, show tabs
  if (canEdit && isShared) {
    return (
      <Dialog open={!!tag} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tag.name}</DialogTitle>
            <DialogDescription>
              Edit tag settings or ask a question
            </DialogDescription>
          </DialogHeader>

          <UnderlineTabs defaultValue="edit" className="w-full">
            <UnderlineTabsList className="grid w-full grid-cols-2">
              <UnderlineTabsTrigger value="edit">Edit Tag</UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="ask">
                Ask Question
              </UnderlineTabsTrigger>
            </UnderlineTabsList>

            <UnderlineTabsContent value="edit" className="mt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <Name form={form} />
                  <Description form={form} />
                  <Color form={form} />
                  <AnswerMode form={form} />
                  <ResponseTime form={form} />

                  <Separator className="my-4" />

                  <ResourcePermissionsManager
                    grants={form.watch("permissions") || []}
                    canEdit={true}
                    isCreating={false}
                    onChange={(permissions) =>
                      form.setValue("permissions", permissions)
                    }
                  />

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update Tag"}
                    </Button>
                  </div>
                </form>
              </Form>
            </UnderlineTabsContent>

            <UnderlineTabsContent value="ask" className="mt-6">
              <AskQuestionFromTag tag={tag} />
            </UnderlineTabsContent>
          </UnderlineTabs>
        </DialogContent>
      </Dialog>
    );
  }

  // If can edit but not shared, show only edit (no tabs)
  return (
    <Dialog open={!!tag} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Update the tag details and availability settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Name form={form} />
            <Description form={form} />
            <Color form={form} />
            <AnswerMode form={form} />
            <ResponseTime form={form} />

            <Separator className="my-4" />

            <ResourcePermissionsManager
              grants={form.watch("permissions") || []}
              canEdit={true}
              isCreating={false}
              onChange={(permissions) =>
                form.setValue("permissions", permissions)
              }
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Tag"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
