import { Button } from "@/components/ui/button";
import { SelectedMembersDisplay } from "@/questions/components/SelectedMembersDisplay";
import { UserSelector } from "@/questions/components/UserSelector";
import { useCreateQuestionDialogStore } from "./createQuestionDialogStore";
import { useMemberships } from "@/members/queries/queries";
import { useUser } from "@clerk/nextjs";

export function SelectUserStep() {
  const memberships = useMemberships();
  const { user } = useUser();
  const { selectedUserIds, setSelectedUserIds, canProceedFromStep1, nextStep } =
    useCreateQuestionDialogStore();

  const handleUserToggle = (userId: string) => {
    // Toggle user in array
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleChangeSelection = () => {
    setSelectedUserIds([]);
  };

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

  const selectedUsers = availableUsers.filter((u) =>
    selectedUserIds.includes(u.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Who do you want to ask?</h3>
        <p className="text-sm text-muted-foreground">
          Select people to ask your question
        </p>
      </div>

      {selectedUsers.length > 0 ? (
        <SelectedMembersDisplay
          users={selectedUsers}
          onChangeSelection={handleChangeSelection}
        />
      ) : (
        <UserSelector
          selectedUserIds={selectedUserIds}
          onUserToggle={handleUserToggle}
          availableUsers={availableUsers}
          placeholder="Search for team members..."
        />
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={nextStep} disabled={!canProceedFromStep1()}>
          Next
        </Button>
      </div>
    </div>
  );
}
