import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";

export function GroupDescriptionInput() {
  const description = useGroupDialogStore((state) => state.description);
  const setDescription = useGroupDialogStore((state) => state.setDescription);

  return (
    <div className="space-y-2">
      <Label htmlFor="group-description">Description (optional)</Label>
      <Textarea
        id="group-description"
        placeholder="What is this group for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
    </div>
  );
}
