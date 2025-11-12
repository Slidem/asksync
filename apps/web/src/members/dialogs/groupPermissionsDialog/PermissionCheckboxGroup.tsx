import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Permission = "view" | "create" | "edit" | "delete";

interface PermissionCheckboxGroupProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
}

const PERMISSION_LABELS: Record<Permission, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

const ALL_PERMISSIONS: Permission[] = ["view", "create", "edit", "delete"];

export function PermissionCheckboxGroup({
  permissions,
  onChange,
  disabled = false,
}: PermissionCheckboxGroupProps) {
  const togglePermission = (permission: Permission) => {
    if (permissions.includes(permission)) {
      onChange(permissions.filter((p) => p !== permission));
    } else {
      onChange([...permissions, permission]);
    }
  };

  return (
    <div className="flex gap-4">
      {ALL_PERMISSIONS.map((permission) => (
        <div key={permission} className="flex items-center gap-2">
          <Checkbox
            id={permission}
            checked={permissions.includes(permission)}
            onCheckedChange={() => togglePermission(permission)}
            disabled={disabled}
          />
          <Label
            htmlFor={permission}
            className="text-sm font-normal cursor-pointer"
          >
            {PERMISSION_LABELS[permission]}
          </Label>
        </div>
      ))}
    </div>
  );
}
