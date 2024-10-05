"use client";

import { ComponentPropsWithoutRef } from "react";
import { toast } from "sonner";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { deleteApp, recoverApp } from "@/server-actions/app";
import { unwrap } from "@/lib/utils";
import {
  deleteVolume,
  recoverVolume,
  updateVolume,
} from "@/server-actions/volume";

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

export type DeleteVolumeItemProps = ComponentPropsWithoutRef<
  typeof ContextMenuItem
> & {
  projectId: string;
  volumeId: string;
};

export function DeleteVolumeItem({
  projectId,
  volumeId,
  onClick,
  ...props
}: DeleteVolumeItemProps) {
  return (
    <ContextMenuItem
      onClick={(e) => {
        toast.promise(deleteVolume({ projectId, volumeId }).then(unwrap), {
          loading: "Deleting volume...",
          success(volume) {
            return `Volume ${volume.name} successfully deleted`;
          },
          error: "Error occurred when delinting volume",
        });
        onClick?.(e);
      }}
      {...props}
    />
  );
}

export type RecoverVolumeItemProps = ComponentPropsWithoutRef<
  typeof ContextMenuItem
> & {
  projectId: string;
  volumeId: string;
};

export function RecoverVolumeItem({
  projectId,
  volumeId,
  onClick,
  ...props
}: RecoverVolumeItemProps) {
  return (
    <ContextMenuItem
      onClick={(e) => {
        toast.promise(recoverVolume({ projectId, volumeId }).then(unwrap), {
          loading: "Recovering volume...",
          success: "Volume successfully recovered",
          error: "Error occurred when recovering volume",
        });
        onClick?.(e);
      }}
      {...props}
    />
  );
}

export type DisconnectVolumeItemProps = ComponentPropsWithoutRef<
  typeof ContextMenuItem
> & {
  projectId: string;
  volumeId: string;
};

export function DisconnectVolumeItem({
  projectId,
  volumeId,
  onClick,
  ...props
}: DisconnectVolumeItemProps) {
  return (
    <ContextMenuItem
      onClick={(e) => {
        toast.promise(
          updateVolume
            .bind(
              null,
              projectId,
              volumeId
            )({ app: { id: undefined } })
            .then(unwrap),
          {
            loading: "Disconnecting volume...",
            success: "Volume successfully disconnected",
            error: "Error occurred when disconnecting volume",
          }
        );
        onClick?.(e);
      }}
      {...props}
    />
  );
}
