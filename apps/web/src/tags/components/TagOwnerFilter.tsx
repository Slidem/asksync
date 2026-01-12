import { Check, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/members/components/MemberAvatar";
import { useMemberships } from "@/members/queries/queries";

interface TagOwnerFilterProps {
  selectedOwnerIds: string[];
  availableOwnerIds: string[];
  onChange: (ownerIds: string[]) => void;
}

export function TagOwnerFilter({
  selectedOwnerIds,
  availableOwnerIds,
  onChange,
}: TagOwnerFilterProps): React.ReactNode {
  const memberships = useMemberships();

  // Filter memberships to only show owners who have tags
  const availableOwners = memberships.filter((m) =>
    availableOwnerIds.includes(m.id),
  );

  const toggleOwner = (ownerId: string) => {
    const isSelected = selectedOwnerIds.includes(ownerId);
    const newOwnerIds = isSelected
      ? selectedOwnerIds.filter((id) => id !== ownerId)
      : [...selectedOwnerIds, ownerId];
    onChange(newOwnerIds);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[160px] justify-start">
          <Users className="h-4 w-4 mr-2" />
          {selectedOwnerIds.length
            ? `${selectedOwnerIds.length} owner${selectedOwnerIds.length > 1 ? "s" : ""}`
            : "All Owners"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-2 space-y-1">
          <button
            className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded-sm"
            onClick={() => onChange([])}
          >
            <div className="w-4 h-4" />
            All Owners
          </button>
          {availableOwners.map((owner) => {
            const isSelected = selectedOwnerIds.includes(owner.id);
            return (
              <button
                key={owner.id}
                className="flex items-center gap-2 w-full p-2 text-sm hover:bg-muted rounded-sm"
                onClick={() => toggleOwner(owner.id)}
              >
                {isSelected && <Check className="h-4 w-4 text-primary" />}
                {!isSelected && <div className="w-4 h-4" />}
                <MemberAvatar id={owner.id} showTooltip={false} />
                <span className="flex-1 text-left truncate">{owner.name}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
