import {
  AnswerMode,
  Color,
  Description,
  IsPublic,
  Name,
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
import { TAG_COLORS } from "@asksync/shared";
import { useForm } from "react-hook-form";
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
  defaultValues?: Pick<
    TagFormData,
    | "name"
    | "description"
    | "color"
    | "answerMode"
    | "responseTimeMinutes"
    | "isPublic"
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
}) => {
  const form = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      color: TAG_COLORS[0],
      answerMode: "scheduled",
      isPublic: true,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Name form={form} />
            <Description form={form} />
            <Color form={form} />
            <AnswerMode form={form} />
            <ResponseTime form={form} />
            <IsPublic form={form} />
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
