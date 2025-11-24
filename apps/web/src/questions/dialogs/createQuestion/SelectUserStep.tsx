import { Button } from "@/components/ui/button";
import { UserSelector } from "@/questions/components/UserSelector";
import { useCreateQuestionDialogStore } from "./createQuestionDialogStore";
import { useMemberships } from "@/members/queries/queries";
import { useUser } from "@clerk/nextjs";

export function SelectUserStep() {
  const memberships = useMemberships();
  const { user } = useUser();
  const { selectedUserId, setSelectedUserId, canProceedFromStep1, nextStep } =
    useCreateQuestionDialogStore();

  const handleUserToggle = (userId: string) => {
    // Toggle: if already selected, unselect
    setSelectedUserId(selectedUserId === userId ? null : userId);
  };

  const selectedUserIds = selectedUserId ? [selectedUserId] : [];

  // Filter out current user
  const availableUsers =
    memberships
      ?.filter((member) => member.id !== user?.id)
      .map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        imageUrl: member.imageUrl,
      })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Who do you want to ask?</h3>
        <p className="text-sm text-muted-foreground">
          Select a user to view their available timeblocks
        </p>
      </div>

      <UserSelector
        selectedUserIds={selectedUserIds}
        onUserToggle={handleUserToggle}
        availableUsers={availableUsers}
        placeholder="Search for a team member..."
        maxSelections={1}
      />

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={nextStep} disabled={!canProceedFromStep1()}>
          Next
        </Button>
      </div>
    </div>
  );
}
