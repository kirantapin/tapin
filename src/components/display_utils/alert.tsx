import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils"; // or use `clsx` / `classnames`
import { useRestaurant } from "@/context/restaurant_context";

export function Alert({
  trigger,
  title,
  description,
  onConfirm,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  confirmClassName,
  cancelClassName,
  contentClassName,
  condition,
  onConditionFailed,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmClassName?: string;
  cancelClassName?: string;
  contentClassName?: string;
  condition?: () => Promise<{
    result: boolean;
    title?: string;
    description?: string;
  }>;
  onConditionFailed?: () => Promise<void>;
}) {
  const { restaurant } = useRestaurant();
  const [open, setOpen] = useState(false);
  const [modifiedDescription, setModifiedDescription] = useState(description);
  const [modifiedTitle, setModifiedTitle] = useState(title);
  const handleTrigger = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (condition) {
      const shouldShow = await condition();
      if (shouldShow.result) {
        setOpen(true);
        setModifiedDescription(shouldShow.description || description);
        setModifiedTitle(shouldShow.title || title);
      } else {
        if (onConditionFailed) {
          await onConditionFailed();
        }
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div onClick={handleTrigger}>{trigger}</div>

      <AlertDialogContent
        className={cn(
          "w-[90vw] max-w-xs rounded-[32px] font-[Gilroy]",
          contentClassName
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-gilroy">
            {modifiedTitle}
          </AlertDialogTitle>
          {modifiedDescription && (
            <AlertDialogDescription className="font-gilroy">
              {modifiedDescription}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2">
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "w-full rounded-full px-3 py-2 text-sm text-white font-gilroy ",
              confirmClassName
            )}
            style={{
              backgroundColor: restaurant?.metadata.primaryColor as string,
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
          <AlertDialogCancel
            className={cn(
              "w-full rounded-full px-3 py-2 text-sm border border-gray-300 font-gilroy",
              cancelClassName,
              "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none"
            )}
          >
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
