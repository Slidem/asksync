import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PermissionLevel = "view" | "edit" | "manage";

interface PermissionSelectorProps {
  value: PermissionLevel;
  onChange: (value: PermissionLevel) => void;
  disabled?: boolean;
}

const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  view: "Can view",
  edit: "Can edit",
  manage: "Can manage",
};

const PERMISSION_DESCRIPTIONS: Record<PermissionLevel, string> = {
  view: "View only",
  edit: "View and edit",
  manage: "Full access - edit, delete, and manage permissions",
};

export function PermissionSelector({
  value,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-auto min-w-[100px]">
        <SelectValue>
          <span>{PERMISSION_LABELS[value]}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="view">
          <div className="flex flex-col gap-0.5 py-1">
            <div className="font-medium">{PERMISSION_LABELS.view}</div>
            <div className="text-xs text-muted-foreground">
              {PERMISSION_DESCRIPTIONS.view}
            </div>
          </div>
        </SelectItem>
        <SelectItem value="edit">
          <div className="flex flex-col gap-0.5 py-1">
            <div className="font-medium">{PERMISSION_LABELS.edit}</div>
            <div className="text-xs text-muted-foreground">
              {PERMISSION_DESCRIPTIONS.edit}
            </div>
          </div>
        </SelectItem>
        <SelectItem value="manage">
          <div className="flex flex-col gap-0.5 py-1">
            <div className="font-medium">{PERMISSION_LABELS.manage}</div>
            <div className="text-xs text-muted-foreground">
              {PERMISSION_DESCRIPTIONS.manage}
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
