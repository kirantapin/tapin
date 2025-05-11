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
import { useRestaurant } from "@/context/restaurant_context";

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
  const { restaurant } = useRestaurant();
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
              "w-full rounded-full px-3 py-2 text-sm text-white font-gilroy ",
              confirmClassName
            )}
            style={{
              backgroundColor: restaurant?.metadata.primaryColor as string,
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
