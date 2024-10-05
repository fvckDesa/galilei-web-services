"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { TVolume, VolumeSchema } from "@gws/api-client";
import { updateVolume } from "@/server-actions/volume";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResourceContent,
  ResourceUpdateButton,
  useResource,
} from "@/components/resource";
import { useEffect, useId } from "react";
import { Input } from "@/components/ui/input";
import { Page } from "@/lib/types";

export default function VolumePage({
  params: { projectId, volumeId },
}: Page<{
  projectId: string;
  volumeId: string;
}>) {
  const { resource: volume } = useResource<TVolume>();

  const formId = useId();

  const {
    form,
    handleSubmitWithAction,
    action: { reset: resetAction },
  } = useHookFormAction(
    updateVolume.bind(null, projectId, volumeId),
    zodResolver(VolumeSchema),
    {
      formProps: {
        reValidateMode: "onBlur",
        defaultValues: {
          ...volume,
          app: {
            id: volume.appId,
          },
        },
      },
    }
  );

  useEffect(() => {
    resetAction();
    form.reset({
      ...volume,
      app: {
        id: volume.appId,
      },
    });
  }, [volume, form, resetAction]);

  return (
    <ResourceContent>
      <Form {...form}>
        <form
          id={formId}
          className="flex flex-col gap-4"
          onSubmit={handleSubmitWithAction}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="off"
                    disabled={volume.deleted}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    autoComplete="off"
                    disabled={volume.deleted}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0", 10))
                    }
                    value={field.value === 0 ? "" : field.value}
                  />
                </FormControl>
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
                    disabled={volume.deleted}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!volume.deleted ? (
            <ResourceUpdateButton
              form={formId}
              loading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
            />
          ) : null}
        </form>
      </Form>
    </ResourceContent>
  );
}
