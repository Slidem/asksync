"use client";

import { CheckCircle, Loader2, UserPlus, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";
import { useState } from "react";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InviteResult = {
  email: string;
  success: boolean;
  error?: string;
};

function parseEmails(input: string): string[] {
  return input
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"));
}

export function InviteDialog({
  open,
  onOpenChange,
}: InviteDialogProps): React.ReactNode {
  const { organization } = useOrganization();
  const [emailsInput, setEmailsInput] = useState("");
  const [role, setRole] = useState<"org:member" | "org:admin">("org:member");
  const [isInviting, setIsInviting] = useState(false);
  const [results, setResults] = useState<InviteResult[]>([]);

  const emails = parseEmails(emailsInput);
  const hasEmails = emails.length > 0;

  const handleClose = () => {
    setEmailsInput("");
    setRole("org:member");
    setResults([]);
    onOpenChange(false);
  };

  const handleInvite = async () => {
    if (!organization || !hasEmails) return;

    setIsInviting(true);
    setResults([]);

    const inviteResults: InviteResult[] = [];

    for (const email of emails) {
      try {
        await organization.inviteMember({
          emailAddress: email,
          role,
        });
        inviteResults.push({ email, success: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to invite";
        inviteResults.push({ email, success: false, error: message });
      }
    }

    setResults(inviteResults);
    setIsInviting(false);

    const successCount = inviteResults.filter((r) => r.success).length;
    const failCount = inviteResults.filter((r) => !r.success).length;

    if (successCount > 0 && failCount === 0) {
      toast.success(
        `Invited ${successCount} ${successCount === 1 ? "member" : "members"}`,
      );
      handleClose();
    } else if (successCount > 0) {
      toast.success(`Invited ${successCount}, failed ${failCount}`);
    } else {
      toast.error("Failed to send invitations");
    }
  };

  const showResults = results.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Invite Members</DialogTitle>
              <DialogDescription>
                Send invitations to join your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="emails">Email addresses</Label>
            <Textarea
              id="emails"
              placeholder="Enter email addresses (comma, semicolon, or newline separated)"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              rows={4}
              disabled={isInviting}
            />
            {hasEmails && (
              <p className="text-xs text-muted-foreground">
                {emails.length} {emails.length === 1 ? "email" : "emails"} to
                invite
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as typeof role)}
              disabled={isInviting}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org:member">Member</SelectItem>
                <SelectItem value="org:admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showResults && (
            <div className="space-y-2 max-h-32 overflow-y-auto rounded-md border p-2">
              {results.map((result) => (
                <div
                  key={result.email}
                  className="flex items-center gap-2 text-sm"
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <span className="truncate">{result.email}</span>
                  {result.error && (
                    <span className="text-xs text-muted-foreground truncate">
                      ({result.error})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isInviting}>
            {showResults ? "Close" : "Cancel"}
          </Button>
          {!showResults && (
            <Button onClick={handleInvite} disabled={!hasEmails || isInviting}>
              {isInviting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inviting...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite {hasEmails ? `(${emails.length})` : ""}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
