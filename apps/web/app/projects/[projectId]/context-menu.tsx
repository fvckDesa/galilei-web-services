"use client";

import { ComponentPropsWithoutRef } from "react";
import { toast } from "sonner";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { deleteApp, recoverApp } from "./apps/[appId]/actions";
import { unwrap } from "@/lib/utils";

export type DeleteAppItemProps = ComponentPropsWithoutRef<
  typeof ContextMenuItem
> & {
  projectId: string;
  appId: string;
};

export function DeleteAppItem({
  projectId,
  appId,
  onClick,
  ...props
}: DeleteAppItemProps) {
  return (
    <ContextMenuItem
      onClick={(e) => {
        toast.promise(deleteApp({ projectId, appId }).then(unwrap), {
          loading: "Deleting app...",
          success(app) {
            return `App ${app.name} successfully deleted`;
          },
          error: "Error occurred when delinting app",
        });
        onClick?.(e);
      }}
      {...props}
    />
  );
}

export type RecoverAppItemProps = ComponentPropsWithoutRef<
  typeof ContextMenuItem
> & {
  projectId: string;
  appId: string;
};

export function RecoverAppItem({
  projectId,
  appId,
  onClick,
  ...props
}: RecoverAppItemProps) {
  return (
    <ContextMenuItem
      onClick={(e) => {
        toast.promise(recoverApp({ projectId, appId }).then(unwrap), {
          loading: "Recovering app...",
          success: "App successfully recovered",
          error: "Error occurred when recovering app",
        });
        onClick?.(e);
      }}
      {...props}
    />
  );
}
