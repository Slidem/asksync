import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";

export function GroupNameInput(): React.ReactNode {
  const name = useGroupDialogStore((state) => state.name);
  const setName = useGroupDialogStore((state) => state.setName);

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="group-name" className="text-sm font-medium">
          Group Name <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Choose a clear, descriptive name for this group
        </p>
      </div>
      <Input
        id="group-name"
        placeholder="e.g., Engineering, Marketing, Support Team"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
    </div>
  );
}
