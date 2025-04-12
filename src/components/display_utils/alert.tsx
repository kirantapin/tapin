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
        className={cn("w-[90vw] max-w-xs rounded-lg", contentClassName)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
          {children}
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2">
          <AlertDialogCancel
            className={cn(
              "w-full rounded-full px-3 py-2 text-sm border border-gray-300",
              cancelClassName
            )}
          >
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "w-full rounded-full px-3 py-2 text-sm text-white " +
                "bg-[linear-gradient(45deg,#ca8a04,#fde047)]",
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
