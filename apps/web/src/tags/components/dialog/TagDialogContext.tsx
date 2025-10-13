"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

import { CreateTagDialog } from "./CreateTagDialog";
import { Tag } from "@asksync/shared";
import { UpdateTagDialog } from "./UpdateTagDialog";

/**
 * Dialog modes for tag management
 */
type DialogMode = "create" | "edit" | "closed";

/**
 * Context value interface for tag dialog management
 */
interface TagDialogContextValue {
  // State
  mode: DialogMode;
  editingTag: Tag | null;
  isOpen: boolean;

  // Actions
  openCreateDialog: () => void;
  openEditDialog: (tag: Tag) => void;
  closeDialog: () => void;

  // Utility
  setEditingTag: (tag: Tag | null) => void;
}

/**
 * React context for tag dialog management
 */
const TagDialogContext = createContext<TagDialogContextValue | undefined>(
  undefined,
);

/**
 * Props for the TagDialogProvider component
 */
interface TagDialogProviderProps {
  children: React.ReactNode;
  /**
   * Optional callback when dialog closes
   */
  onDialogClose?: () => void;
  /**
   * Optional callback when tag is created
   */
  onTagCreated?: (tag?: Tag) => void;
  /**
   * Optional callback when tag is updated
   */
  onTagUpdated?: (tag: Tag) => void;
}

/**
 * Provider component for tag dialog management
 * Handles the state and logic for opening/closing tag dialogs
 */
export const TagDialogProvider: React.FC<TagDialogProviderProps> = ({
  children,
  onDialogClose,
  onTagCreated,
  onTagUpdated,
}) => {
  const [mode, setMode] = useState<DialogMode>("closed");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const openCreateDialog = useCallback(() => {
    setEditingTag(null);
    setMode("create");
  }, []);

  const openEditDialog = useCallback((tag: Tag) => {
    setEditingTag(tag);
    setMode("edit");
  }, []);

  const closeDialog = useCallback(() => {
    setMode("closed");
    setEditingTag(null);
    onDialogClose?.();
  }, [onDialogClose]);

  const handleCreateDialogChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
        onTagCreated?.();
      } else {
        openCreateDialog();
      }
    },
    [closeDialog, onTagCreated, openCreateDialog],
  );

  const handleEditDialogChange = useCallback(
    (open: boolean) => {
      if (!open) {
        const tag = editingTag;
        closeDialog();
        if (tag) {
          onTagUpdated?.(tag);
        }
      }
    },
    [closeDialog, editingTag, onTagUpdated],
  );

  const value: TagDialogContextValue = {
    mode,
    editingTag,
    isOpen: mode !== "closed",
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setEditingTag,
  };

  return (
    <TagDialogContext.Provider value={value}>
      {children}

      {/* Create Dialog */}
      <CreateTagDialog
        open={mode === "create"}
        onOpenChange={handleCreateDialogChange}
      />

      {/* Edit Dialog */}
      <UpdateTagDialog
        tag={mode === "edit" ? editingTag : null}
        onOpenChange={handleEditDialogChange}
      />
    </TagDialogContext.Provider>
  );
};

/**
 * Hook to access the tag dialog context
 * @throws Error if used outside of TagDialogProvider
 */
export const useTagDialog = (): TagDialogContextValue => {
  const context = useContext(TagDialogContext);
  if (!context) {
    throw new Error("useTagDialog must be used within a TagDialogProvider");
  }
  return context;
};

/**
 * Hook specifically for opening the create dialog
 */
export const useCreateTagDialog = () => {
  const { openCreateDialog, closeDialog, mode } = useTagDialog();
  return {
    openDialog: openCreateDialog,
    closeDialog,
    isOpen: mode === "create",
  };
};

/**
 * Hook specifically for opening the edit dialog
 */
export const useEditTagDialog = () => {
  const { openEditDialog, closeDialog, mode, editingTag } = useTagDialog();
  return {
    openDialog: openEditDialog,
    closeDialog,
    isOpen: mode === "edit",
    editingTag,
  };
};

/**
 * Hook for checking if any tag dialog is open
 */
export const useIsTagDialogOpen = () => {
  const { isOpen } = useTagDialog();
  return isOpen;
};

/**
 * Hook to programmatically control tag dialogs with full flexibility
 */
export const useTagDialogControl = () => {
  const {
    mode,
    editingTag,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setEditingTag,
  } = useTagDialog();

  return {
    // State
    currentMode: mode,
    currentTag: editingTag,
    isOpen: mode !== "closed",
    isCreateMode: mode === "create",
    isEditMode: mode === "edit",

    // Actions
    create: openCreateDialog,
    edit: openEditDialog,
    close: closeDialog,

    // Advanced control
    setTag: setEditingTag,
    toggle: () => {
      if (mode === "closed") {
        openCreateDialog();
      } else {
        closeDialog();
      }
    },
  };
};
