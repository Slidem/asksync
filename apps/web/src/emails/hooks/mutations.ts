import { Id } from "@convex/dataModel";
import { api } from "@convex/api";
import { confirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useState } from "react";

export const useTriggerGmailSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const triggerSyncMutation = useMutation(api.gmail.mutations.triggerSync);

  const triggerSync = async (connectionId: Id<"gmailConnections">) => {
    try {
      setIsSyncing(true);
      await triggerSyncMutation({ connectionId });
      toast.success("Sync started");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to trigger sync",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return { triggerSync, isSyncing };
};

export const useDisconnectGmail = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const disconnectMutation = useMutation(api.gmail.mutations.disconnectAccount);

  const disconnectAccount = async (
    connectionId: Id<"gmailConnections">,
    email: string,
  ) => {
    confirmDialog.show({
      title: "Disconnect Gmail",
      description: `This will disconnect ${email} and delete all associated rules and attention items. Are you sure?`,
      onConfirm: async () => {
        try {
          setIsDisconnecting(true);
          await disconnectMutation({ connectionId });
          toast.success("Gmail account disconnected");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to disconnect account",
          );
        } finally {
          setIsDisconnecting(false);
        }
      },
    });
  };

  return { disconnectAccount, isDisconnecting };
};

export interface CreateRuleData {
  connectionId: Id<"gmailConnections">;
  name: string;
  senderPattern?: string;
  subjectPattern?: string;
  contentPattern?: string;
  autoTagIds: string[];
}

export const useCreateRule = () => {
  const [isCreating, setIsCreating] = useState(false);
  const createMutation = useMutation(api.gmail.mutations.createRule);

  const createRule = async (data: CreateRuleData) => {
    try {
      setIsCreating(true);
      const ruleId = await createMutation(data);
      toast.success("Rule created");
      return ruleId;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create rule",
      );
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { createRule, isCreating };
};

export interface UpdateRuleData {
  ruleId: Id<"emailConversionRules">;
  name?: string;
  senderPattern?: string;
  subjectPattern?: string;
  contentPattern?: string;
  autoTagIds?: string[];
  isEnabled?: boolean;
  priority?: number;
}

export const useUpdateRule = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateMutation = useMutation(api.gmail.mutations.updateRule);

  const updateRule = async (data: UpdateRuleData) => {
    try {
      setIsUpdating(true);
      await updateMutation(data);
      toast.success("Rule updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update rule",
      );
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateRule, isUpdating };
};

export const useDeleteRule = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMutation = useMutation(api.gmail.mutations.deleteRule);

  const deleteRule = async (
    ruleId: Id<"emailConversionRules">,
    ruleName: string,
  ) => {
    confirmDialog.show({
      title: "Delete rule",
      description: `Are you sure you want to delete the rule "${ruleName}"?`,
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await deleteMutation({ ruleId });
          toast.success("Rule deleted");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to delete rule",
          );
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return { deleteRule, isDeleting };
};

export const useResolveItem = () => {
  const resolveMutation = useMutation(api.gmail.mutations.resolveItem);
  const unresolveMutation = useMutation(api.gmail.mutations.unresolveItem);

  const resolveItem = async (itemId: Id<"emailAttentionItems">) => {
    try {
      await resolveMutation({ itemId });
      toast.success("Marked as resolved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resolve item",
      );
    }
  };

  const unresolveItem = async (itemId: Id<"emailAttentionItems">) => {
    try {
      await unresolveMutation({ itemId });
      toast.success("Marked as pending");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unresolve item",
      );
    }
  };

  return { resolveItem, unresolveItem };
};

export const useDeleteItem = () => {
  const deleteMutation = useMutation(api.gmail.mutations.deleteItem);

  const deleteItem = async (itemId: Id<"emailAttentionItems">) => {
    confirmDialog.show({
      title: "Delete attention item",
      description: "Are you sure you want to delete this attention item?",
      onConfirm: async () => {
        try {
          await deleteMutation({ itemId });
          toast.success("Item deleted");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to delete item",
          );
        }
      },
    });
  };

  return { deleteItem };
};
