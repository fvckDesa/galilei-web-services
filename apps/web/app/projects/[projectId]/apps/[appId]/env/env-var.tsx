"use client";

import { useResource } from "@/components/resource";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { unwrap } from "@/lib/utils";
import { deleteAppEnv, updateAppEnv } from "@/server-actions/env";
import { EnvSchema, TAppService } from "@gws/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import {
  CircleCheck,
  CircleX,
  EllipsisVertical,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

export interface EnvVarProps {
  projectId: string;
  appId: string;
  envId: string;
  name: string;
  value: string;
}

export function EnvVar({ projectId, appId, envId, name, value }: EnvVarProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const { resource: app } = useResource<TAppService>();

  const { form, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(
      updateAppEnv.bind(null, projectId, appId, envId),
      zodResolver(EnvSchema),
      {
        formProps: {
          defaultValues: { name, value },
        },
        actionProps: {
          onSuccess() {
            setIsEditMode(false);
          },
        },
      }
    );

  const { executeAsync, isExecuting } = useAction(deleteAppEnv);

  return (
    <li className="border-b border-border px-2 py-1 last:border-b-0">
      {isEditMode && !app.deleted ? (
        <Form {...form}>
          <form
            onSubmit={handleSubmitWithAction}
            className="flex w-full items-center justify-between gap-4"
          >
            <ScrollArea className="flex-1 px-2 py-1">
              <span className="text-nowrap">{name}</span>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem className="w-full flex-1">
                  <FormControl autoFocus>
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Variable value"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-1">
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                icon={<CircleCheck />}
                loading={form.formState.isSubmitting}
                disabled={!form.formState.isDirty}
              />
              <Button
                type="reset"
                size="icon"
                variant="ghost"
                icon={<CircleX />}
                onClick={() => {
                  resetFormAndAction();
                  setIsEditMode(false);
                }}
              />
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex w-full items-center justify-between gap-4">
          <ScrollArea className="flex-1 px-2 py-1">
            <span className="text-nowrap">{name}</span>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <ScrollArea className="flex-1 px-2 py-1">
            <span className="text-nowrap">{value}</span>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                icon={<EllipsisVertical />}
                disabled={isExecuting || app.deleted}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-60">
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setIsEditMode(true)}
              >
                <SquarePen className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive hover:text-destructive focus:text-destructive"
                onClick={() =>
                  toast.promise(
                    executeAsync({ projectId, appId, envId }).then(unwrap),
                    {
                      loading: `Deleting variable ${name}...`,
                      success: `Variable ${name} successfully deleted`,
                      error: `Unable to delete variable ${name}`,
                    }
                  )
                }
              >
                <Trash2 className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </li>
  );
}
