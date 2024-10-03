"use client";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { createAppEnv } from "@/server-actions/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnvSchema } from "@gws/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface EnvFormProps {
  projectId: string;
  appId: string;
  onAdd: () => void;
  onCancel: () => void;
}

export function EnvForm({ projectId, appId, onAdd, onCancel }: EnvFormProps) {
  const {
    form,
    action: { result },
    handleSubmitWithAction,
    resetFormAndAction,
  } = useHookFormAction(
    createAppEnv.bind(null, projectId, appId),
    zodResolver(EnvSchema),
    {
      formProps: {
        defaultValues: {
          name: "",
          value: "",
        },
      },
      actionProps: {
        onSuccess() {
          onAdd();
        },
      },
    }
  );

  useEffect(() => {
    if (result.serverError) {
      const alreadyExistsErr = "Variable name already used";

      switch (result.serverError.kind) {
        case "AlreadyExists":
          form.setError(
            "name",
            {
              type: "request",
              message: alreadyExistsErr,
            },
            { shouldFocus: true }
          );
          toast.error(alreadyExistsErr);
          break;
        default:
          toast.error(`Unable to create env variable`);
          break;
      }
    }
  }, [form, result]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col items-end gap-4 sm:flex-row"
        onSubmit={handleSubmitWithAction}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full flex-1">
              <FormControl>
                <Input
                  type="text"
                  autoComplete="off"
                  placeholder="Variable name"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="w-full flex-1">
              <FormControl>
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
        <footer className="flex w-full flex-row-reverse gap-2 sm:w-auto sm:flex-row">
          <Button
            type="submit"
            className="flex-1 sm:flex-none"
            icon={<Plus />}
            disabled={!form.formState.isValid}
            loading={form.formState.isSubmitting}
          >
            Add
          </Button>
          <Button
            type="reset"
            className="flex-1 sm:flex-none"
            variant="secondary"
            onClick={() => {
              onCancel();
              resetFormAndAction();
            }}
          >
            Cancel
          </Button>
        </footer>
      </form>
    </Form>
  );
}
