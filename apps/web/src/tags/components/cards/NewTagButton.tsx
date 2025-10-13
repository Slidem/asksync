import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import { useCreateTagDialog } from "@/tags/components/dialog/TagDialogContext";

export const NewTagButton = () => {
  const { openDialog } = useCreateTagDialog();

  return (
    <Button
      size="icon"
      className="rounded-full h-10 w-10 shrink-0"
      onClick={openDialog}
    >
      <Plus className="h-5 w-5" />
    </Button>
  );
};
