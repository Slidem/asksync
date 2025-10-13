import { Plus } from "lucide-react";
import React from "react";
import { useCreateTagDialog } from "@/tags/components/dialog/TagDialogContext";

export const NewTagCard = () => {
  const { openDialog } = useCreateTagDialog();

  return (
    <div
      className="group relative cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={openDialog}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          openDialog();
        }
      }}
    >
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/40 hover:bg-muted/20 transition-colors">
        <div className="flex items-center justify-center gap-6">
          <div className="rounded-full bg-muted p-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-medium text-muted-foreground">
              Create New Tag
            </h3>
            <p className="text-muted-foreground/70">
              Add a new category for your questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
