import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";

export function GroupDescriptionInput() {
  const description = useGroupDialogStore((state) => state.description);
  const setDescription = useGroupDialogStore((state) => state.setDescription);

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="group-description" className="text-sm font-medium">
          Description
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Optional - Describe the purpose of this group
        </p>
      </div>
      <Textarea
        id="group-description"
        placeholder="e.g., Frontend developers working on the web application"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="resize-none"
      />
    </div>
  );
}
