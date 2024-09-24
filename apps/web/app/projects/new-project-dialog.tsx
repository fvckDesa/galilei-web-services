"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
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
import { createNewProject } from "./actions";
import { ProjectSchema } from "@gws/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);

  const {
    form,
    action: { result },
    handleSubmitWithAction,
    resetFormAndAction,
  } = useHookFormAction(createNewProject, zodResolver(ProjectSchema), {
    formProps: {
      defaultValues: {
        name: "",
      },
    },
  });

  const closeDialog = useCallback(() => {
    resetFormAndAction();
    setOpen(false);
  }, [resetFormAndAction, setOpen]);

  useEffect(() => {
    if (result.data) {
      closeDialog();
      return;
    }
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
  }, [form, result, closeDialog]);

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button icon={<Plus />}>New Project</Button>
      </ResponsiveDialogTrigger>
      <Form {...form}>
        <ResponsiveDialogContent asChild>
          <form onSubmit={handleSubmitWithAction}>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Create new Project</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Group of resources belonging to the same project
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <div className="p-4 sm:p-0">
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
            <ResponsiveDialogFooter className="sm:flex-row-reverse sm:justify-start sm:gap-2">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                loading={form.formState.isSubmitting}
              >
                Create
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root?.message}
              </p>
            </ResponsiveDialogFooter>
          </form>
        </ResponsiveDialogContent>
      </Form>
    </ResponsiveDialog>
  );
}
