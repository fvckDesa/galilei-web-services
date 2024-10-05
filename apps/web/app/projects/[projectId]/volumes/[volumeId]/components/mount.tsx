"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/responsive-dialog";
import { VolumeMountForm } from "@/components/volume-mount-form";
import { ComponentPropsWithoutRef, ReactNode, useState } from "react";

export function Mount({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof VolumeMountForm> & { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>{children}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <VolumeMountForm {...props} onSuccess={() => setOpen(false)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
