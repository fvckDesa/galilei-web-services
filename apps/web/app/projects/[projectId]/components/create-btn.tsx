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
import { Container, HardDrive, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppServiceSchema, VolumeSchema } from "@gws/api-client";
import { createApp } from "@/server-actions/app";
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
import { createVolume } from "@/server-actions/volume";

type DialogType = "app" | "volume";

interface CreateBtnProps {
  project: string;
}

export function CreateBtn({ project }: CreateBtnProps) {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType | null>(null);

  function changeDialogType(type: DialogType) {
    return function () {
      setDialogType(type);
    };
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setDialogType(null);
    }

    setOpen(open);
  }

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <ResponsiveDialog
      open={open && dialogType != null}
      onOpenChange={handleOpenChange}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" icon={<Plus />}>
            Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-60">
          <ResponsiveDialogTrigger
            className="flex cursor-pointer items-center gap-2 px-4 py-2"
            asChild
          >
            <DropdownMenuItem onClick={changeDialogType("app")}>
              <Container className="size-6" />
              <span className="font-bold">App</span>
            </DropdownMenuItem>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogTrigger
            className="flex cursor-pointer items-center gap-2 px-4 py-2"
            asChild
          >
            <DropdownMenuItem onClick={changeDialogType("volume")}>
              <HardDrive className="size-6" />
              <span className="font-bold">Volume</span>
            </DropdownMenuItem>
          </ResponsiveDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResponsiveDialogContent className="flex max-h-[90%] flex-col overflow-hidden">
        {dialogType === "app" ? (
          <>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>New App</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Create new isolated execution environment
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <NewAppForm project={project} closeDialog={closeDialog} />
          </>
        ) : null}
        {dialogType === "volume" ? (
          <>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>New Volume</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Persist data beyond the lifecycle of a container
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <NewVolumeForm project={project} closeDialog={closeDialog} />
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
          publicDomain: {},
          privateDomain: {},
        },
      },
      actionProps: {
        onSuccess() {
          closeDialog();
        },
      },
    }
  );

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
        <ResponsiveDialogFooter className="flex-row">
          <Button
            type="button"
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => {
              resetFormAndAction();
              closeDialog();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            loading={form.formState.isSubmitting}
          >
            Create
          </Button>
        </ResponsiveDialogFooter>
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.root?.message}
        </p>
      </form>
    </Form>
  );
}

interface NewVolumeFormProps {
  project: string;
  closeDialog: () => void;
}

function NewVolumeForm({ project, closeDialog }: NewVolumeFormProps) {
  const {
    form,
    action: { result },
    handleSubmitWithAction,
    resetFormAndAction,
  } = useHookFormAction(
    createVolume.bind(null, project),
    zodResolver(VolumeSchema),
    {
      formProps: {
        defaultValues: {
          name: "",
          capacity: 500,
          path: "/data",
          app: {},
        },
      },
      actionProps: {
        onSuccess() {
          closeDialog();
        },
      },
    }
  );

  useEffect(() => {
    if (!result.serverError) {
      return;
    }

    switch (result.serverError.kind) {
      case "AlreadyExists":
        form.setError("name", {
          type: "response",
          message: `Volume ${form.getValues().name} already exists. Try Another name.`,
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
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      autoComplete="off"
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
          </div>
        </ScrollArea>
        <ResponsiveDialogFooter className="flex-row">
          <Button
            type="button"
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => {
              resetFormAndAction();
              closeDialog();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            loading={form.formState.isSubmitting}
          >
            Create
          </Button>
        </ResponsiveDialogFooter>
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.root?.message}
        </p>
      </form>
    </Form>
  );
}
