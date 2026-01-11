import {
  AnswerMode,
  Color,
  Description,
  Name,
  NotificationSettings,
  ResponseTime,
} from "@/tags/components/dialog/TagFormFields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect } from "react";
import { TagFormData, tagFormSchema } from "@/tags/model";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ResourcePermissionsManager } from "@/components/permissions";
import { Separator } from "@/components/ui/separator";
import { TAG_COLORS } from "@asksync/shared";
import { getDefaultCreateResourceGrants } from "@/components/permissions/types";
import { useForm } from "react-hook-form";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";

interface TagFormDialogProps {
  open: boolean;
  title: string;
  description: string;
  submitButtonText: string;
  loadingText: string;
  onSubmit: (data: TagFormData) => void;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  isCreating?: boolean; // Show permission manager only during creation
  defaultValues?: Pick<
    TagFormData,
    | "name"
    | "description"
    | "color"
    | "answerMode"
    | "responseTimeMinutes"
    | "browserNotificationEnabled"
    | "soundNotificationEnabled"
    | "permissions"
  >;
}

const TagFormDialog: React.FC<TagFormDialogProps> = ({
  open,
  title,
  description,
  submitButtonText,
  loadingText,
  onSubmit,
  onOpenChange,
  defaultValues,
  isLoading = false,
  isCreating = false,
}) => {
  const { user } = useUser();

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      color: TAG_COLORS[0],
      answerMode: "scheduled",
      permissions: getDefaultCreateResourceGrants(user?.id || ""),
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }

    if (open && defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const handleSubmit = (data: TagFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 min-w-0"
          >
            <Name form={form} />
            <Description form={form} />
            <Color form={form} />
            <AnswerMode form={form} />
            <ResponseTime form={form} />

            <Separator className="my-4" />

            <div>
              <h3 className="text-sm font-medium mb-3">Notifications</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get alerted when new items with this tag need attention
              </p>
              <NotificationSettings form={form} />
            </div>

            <Separator className="my-4" />

            <ResourcePermissionsManager
              grants={form.watch("permissions") || []}
              canEdit={true}
              isCreating={isCreating}
              onChange={(permissions) =>
                form.setValue("permissions", permissions)
              }
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? loadingText : submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TagFormDialog;
