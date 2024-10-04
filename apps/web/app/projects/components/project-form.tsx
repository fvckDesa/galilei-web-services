"use client";

import {
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { ProjectSchema, TProjectSchema } from "@gws/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { ReactNode, useEffect } from "react";
import { HookSafeActionFn } from "next-safe-action/hooks";
import { ActionError } from "@/lib/utils";
import { Schema } from "zod";
import { BindArgsValidationErrors, ValidationErrors } from "next-safe-action";

interface ProjectFormProps<
  ServerError extends ActionError,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<typeof ProjectSchema>,
  CBAVE = BindArgsValidationErrors<BAS>,
> {
  action: HookSafeActionFn<
    ServerError,
    typeof ProjectSchema,
    BAS,
    CVE,
    CBAVE,
    TProjectSchema
  >;
  title: ReactNode;
  description: ReactNode;
  submitBtn: ReactNode;
  name?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ProjectForm<
  ServerError extends ActionError,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<typeof ProjectSchema>,
  CBAVE = BindArgsValidationErrors<BAS>,
>({
  action,
  title,
  description,
  submitBtn,
  name = "",
  onCancel,
  onSuccess,
}: ProjectFormProps<ServerError, BAS, CVE, CBAVE>) {
  const {
    form,
    action: { result },
    handleSubmitWithAction,
    resetFormAndAction,
  } = useHookFormAction(action, zodResolver(ProjectSchema), {
    formProps: {
      defaultValues: {
        name,
      },
    },
    actionProps: {
      onSuccess() {
        onSuccess?.();
      },
    },
  });

  useEffect(() => {
    if (!result.serverError) {
      return;
    }

    switch (result.serverError.kind) {
      case "AlreadyExists":
        form.setError("name", {
          type: "response",
          message: `Project ${form.getValues().name} already exists. Try Another name.`,
        });
        break;
      default:
        form.setError("root", {
          type: "response",
          message:
            "Oops! An unexpected error occurred. Please refresh the page or try again later.",
        });
        break;
    }
  }, [form, result]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmitWithAction}
        className="flex flex-col gap-2 sm:gap-4"
      >
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {description}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="px-4 py-2 sm:p-0">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project name</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <ResponsiveDialogFooter className="flex-row px-4 py-2 sm:justify-end sm:gap-2 sm:p-0">
          <Button
            type="button"
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => {
              resetFormAndAction();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            loading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            {submitBtn}
          </Button>
        </ResponsiveDialogFooter>
        {form.formState.errors.root?.message ? (
          <p className="p-4 pt-0 text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>
    </Form>
  );
}
