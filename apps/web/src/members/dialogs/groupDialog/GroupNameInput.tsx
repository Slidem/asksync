import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGroupDialogStore } from "@/members/stores/groupDialogStore";

export function GroupNameInput() {
  const name = useGroupDialogStore((state) => state.name);
  const setName = useGroupDialogStore((state) => state.setName);

  return (
    <div className="space-y-2">
      <Label htmlFor="group-name">Group Name</Label>
      <Input
        id="group-name"
        placeholder="Engineering, Sales, Support..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
    </div>
  );
}
