"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TVolume } from "@gws/api-client";
import {
  HardDrive,
  PlugZap,
  Settings,
  Trash2,
  Undo2,
  Unplug,
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { VolumeMountForm } from "@/components/volume-mount-form";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DeleteVolumeItem,
  DisconnectVolumeItem,
  RecoverVolumeItem,
} from "./context-menu";

export interface VolumeProps {
  volume: TVolume;
  className?: string;
  mountSelectContent?: ReactNode;
  disableMount?: boolean;
}

export function Volume({
  volume,
  className,
  mountSelectContent,
  disableMount = false,
}: VolumeProps) {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Link
            className={cn(
              "flex size-full border-2 border-gray-400 transition-colors bg-secondary hover:bg-secondary/40 items-center gap-4 px-6 py-2 focus-visible:border-primary rounded-[inherit] focus-visible:outline-none",
              volume.deleted &&
                "bg-destructive/30 hover:bg-destructive/20 border-destructive line-through decoration-2",
              className
            )}
            href={`/projects/${volume.projectId}/volumes/${volume.id}`}
          >
            <HardDrive />
            <span className="flex-1 overflow-hidden text-ellipsis text-nowrap">
              {volume.name}
            </span>
            {!volume.appId && !volume.deleted ? (
              <ResponsiveDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary"
                  disabled={disableMount}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                  }}
                >
                  Mount
                </Button>
              </ResponsiveDialogTrigger>
            ) : null}
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-60">
          {volume.appId ? (
            <DisconnectVolumeItem
              projectId={volume.projectId}
              volumeId={volume.id}
              className="flex items-center gap-2"
            >
              <Unplug className="size-4" />
              <span>Disconnect volume</span>
            </DisconnectVolumeItem>
          ) : (
            <ResponsiveDialogTrigger asChild>
              <ContextMenuItem className="flex items-center gap-2">
                <PlugZap className="size-4" />
                <span>Mount volume</span>
              </ContextMenuItem>
            </ResponsiveDialogTrigger>
          )}
          <ContextMenuItem className="flex items-center gap-2" asChild>
            <Link href={`/projects/${volume.projectId}/volumes/${volume.id}`}>
              <Settings className="size-4" />
              <span>View settings</span>
            </Link>
          </ContextMenuItem>
          {volume.deleted ? (
            <RecoverVolumeItem
              projectId={volume.projectId}
              volumeId={volume.id}
              className="flex items-center gap-2"
            >
              <Undo2 className="size-4" />
              <span>Recover</span>
            </RecoverVolumeItem>
          ) : (
            <DeleteVolumeItem
              projectId={volume.projectId}
              volumeId={volume.id}
              className="flex w-full items-center gap-2 text-destructive hover:text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              <span>Delete</span>
            </DeleteVolumeItem>
          )}
        </ContextMenuContent>
        <ResponsiveDialogContent>
          <VolumeMountForm
            volume={volume}
            mountSelectContent={mountSelectContent}
            onSuccess={() => setOpen(false)}
          />
        </ResponsiveDialogContent>
      </ContextMenu>
    </ResponsiveDialog>
  );
}
