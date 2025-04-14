// ConfirmDialog.tsx
import * as React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils"; // or use `clsx` / `classnames`

export function Alert({
  trigger,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  confirmClassName,
  cancelClassName,
  contentClassName,
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent
        className={cn(
          "w-[90vw] max-w-xs rounded-lg font-gilroy",
          contentClassName
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-gilroy">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="font-gilroy">
              {description}
            </AlertDialogDescription>
          )}
          {children}
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2">
          <AlertDialogCancel
            className={cn(
              "w-full rounded-full px-3 py-2 text-sm border border-gray-300 font-gilroy",
              cancelClassName
            )}
          >
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "w-full rounded-full px-3 py-2 text-sm text-white font-gilroy " +
                "bg-[linear-gradient(45deg,#CAA650,#F4E4A8)]",
              confirmClassName
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
