"use client";

import { TVolume, VolumeSchema } from "@gws/api-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { ReactNode } from "react";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { updateVolume } from "@/server-actions/volume";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "./ui/scroll-area";
import {
  ResponsiveDialogClose,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "./responsive-dialog";
import { Select, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Schema = VolumeSchema.pick({ app: true, path: true }).refine(
  ({ app }) => app.id != undefined,
  {
    message: "App required",
    path: ["app.id"],
  }
);

interface VolumeMountFormProps {
  volume: TVolume;
  mountSelectContent: ReactNode;
  onSuccess?: () => void;
}

export function VolumeMountForm({
  volume,
  mountSelectContent,
  onSuccess,
}: VolumeMountFormProps) {
  const { form, handleSubmitWithAction } = useHookFormAction(
    updateVolume.bind(null, volume.projectId, volume.id),
    zodResolver(Schema),
    {
      formProps: {
        defaultValues: {
          app: {},
          path: volume.path,
        },
      },
      actionProps: {
        onSuccess() {
          onSuccess?.();
        },
      },
    }
  );
  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-4">
        <ScrollArea type="auto" className="flex flex-1 flex-col" overflowMarker>
          <div className="flex flex-col gap-4 px-4 py-2 sm:px-1">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Mount {volume.name}</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Mount Volume {volume.name} to an app
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <FormField
              control={form.control}
              name="app.id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the app where to mount the volume" />
                      </SelectTrigger>
                    </FormControl>
                    {mountSelectContent}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Path</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Mount path in app"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
        <ResponsiveDialogFooter className="flex-row">
          <ResponsiveDialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            loading={form.formState.isSubmitting}
          >
            Mount
          </Button>
        </ResponsiveDialogFooter>
      </form>
    </Form>
  );
}
