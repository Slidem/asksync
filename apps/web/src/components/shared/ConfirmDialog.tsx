"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { create } from "zustand";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  show: (options: {
    title: string;
    description: string;
    onConfirm: () => void;
  }) => void;
  hide: () => void;
}

export const useConfirmDialogStore = create<ConfirmDialogState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: () => {},
  show: ({ title, description, onConfirm }) =>
    set({ isOpen: true, title, description, onConfirm }),
  hide: () => set({ isOpen: false }),
}));

export function ConfirmDialog(): React.ReactNode {
  const { isOpen, title, description, onConfirm, hide } =
    useConfirmDialogStore();

  const handleConfirm = () => {
    onConfirm();
    hide();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && hide()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const confirmDialog = {
  show: (options: {
    title: string;
    description: string;
    onConfirm: () => void;
  }) => useConfirmDialogStore.getState().show(options),
};
