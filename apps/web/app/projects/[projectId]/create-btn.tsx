"use client";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/responsive-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Container, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppServiceSchema } from "@gws/api-client";
import { createApp } from "./actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type DialogType = "app";

interface CreateBtnProps {
  project: string;
}

export function CreateBtn({ project }: CreateBtnProps) {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>("app");

  function changeDialogType(type: DialogType) {
    return function () {
      setDialogType(type);
    };
  }

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" icon={<Plus />}>
            Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ResponsiveDialogTrigger
            className="flex cursor-pointer items-center justify-center gap-2"
            asChild
          >
            <DropdownMenuItem onClick={changeDialogType("app")}>
              <Container className="size-6" />
              <span className="font-bold">App</span>
            </DropdownMenuItem>
          </ResponsiveDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResponsiveDialogContent className="flex max-h-[90%] flex-col overflow-hidden">
        {dialogType === "app" ? (
          <>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>New App</ResponsiveDialogTitle>
              <ResponsiveDialogDescription></ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <NewAppForm project={project} closeDialog={closeDialog} />
          </>
        ) : null}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

interface NewAppFormProps {
  project: string;
  closeDialog: () => void;
}

function NewAppForm({ project, closeDialog }: NewAppFormProps) {
  const {
    form,
    action: { result },
    handleSubmitWithAction,
    resetFormAndAction,
  } = useHookFormAction(
    createApp.bind(null, project),
    zodResolver(AppServiceSchema),
    {
      formProps: {
        defaultValues: {
          name: "",
          image: "",
          port: 80,
          replicas: 3,
          public_domain: {},
        },
      },
      actionProps: {
        onSuccess() {
          closeDialog();
        },
      },
    }
  );

  const close = useCallback(() => {
    resetFormAndAction();
    closeDialog();
  }, [closeDialog, resetFormAndAction]);

  useEffect(() => {
    if (!result.serverError) {
      return;
    }

    switch (result.serverError.kind) {
      case "AlreadyExists":
        form.setError("name", {
          type: "response",
          message: `App ${form.getValues().name} already exists. Try Another name.`,
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
        className="flex flex-1 flex-col gap-2 overflow-hidden"
        onSubmit={handleSubmitWithAction}
      >
        <ScrollArea type="auto" className="flex flex-1 flex-col" overflowMarker>
          <div className="flex flex-col gap-4 px-4 py-2 sm:px-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input type="text" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
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
            onClick={() => close()}
          >
            Cancel
          </Button>
        </ResponsiveDialogFooter>
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.root?.message}
        </p>
      </form>
    </Form>
  );
}
