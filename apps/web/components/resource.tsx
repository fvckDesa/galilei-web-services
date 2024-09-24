"use client";

import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Form } from "./ui/form";
import {
  HookProps,
  useHookFormAction,
} from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Schema, z } from "zod";
import { BindArgsValidationErrors, ValidationErrors } from "next-safe-action";
import { ActionError, cn, unwrap } from "@/lib/utils";
import { HookSafeActionFn, useAction } from "next-safe-action/hooks";
import { FieldPath, useFormContext } from "react-hook-form";
import {
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
} from "./responsive-sheet";
import { useScreenMediaQuery } from "@/hooks/screen-media-query";
import { Button } from "./ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

type ResponseErrorMap<S extends Schema> = {
  [K in keyof z.infer<S>]?: string;
};

function Resource({ className, ...props }: ComponentPropsWithoutRef<"aside">) {
  return (
    <aside
      className={cn("relative flex flex-1 flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

type ResourceFormProps<
  ServerError extends ActionError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<S>,
  CBAVE = BindArgsValidationErrors<BAS>,
  Data = unknown,
> = ComponentPropsWithoutRef<"form"> & {
  schema: S;
  updateAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>;
  mapResponse: (data: Data) => z.infer<S>;
  setResponseErrors?: (err: ServerError) => ResponseErrorMap<S>;
} & HookProps<ServerError, S, BAS, CVE, CBAVE, Data>;

function ResourceForm<
  ServerError extends ActionError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<S>,
  CBAVE = BindArgsValidationErrors<BAS>,
  Data = unknown,
>({
  className,
  schema,
  updateAction,
  children,
  actionProps,
  formProps,
  errorMapProps,
  mapResponse,
  setResponseErrors,
  ...props
}: ResourceFormProps<ServerError, S, BAS, CVE, CBAVE, Data>) {
  const {
    form,
    action: { result, reset },
    resetFormAndAction,
    handleSubmitWithAction,
  } = useHookFormAction(updateAction, zodResolver(schema), {
    formProps: {
      ...formProps,
      reValidateMode: "onBlur",
    },
    actionProps,
    errorMapProps,
  });

  useEffect(() => {
    if (result.data) {
      form.reset(mapResponse(result.data));
      reset();
      return;
    }
    if (!result.serverError || !setResponseErrors) {
      return;
    }

    for (const [name, error] of Object.entries(
      setResponseErrors(result.serverError)
    )) {
      form.setError(name as FieldPath<z.infer<S>>, {
        type: "response",
        message: error,
      });
    }
  }, [result, form, resetFormAndAction, setResponseErrors, reset, mapResponse]);

  return (
    <Form {...form}>
      <form
        className={cn("flex-1 flex flex-col overflow-hidden", className)}
        onSubmit={handleSubmitWithAction}
        {...props}
      >
        {children}
      </form>
    </Form>
  );
}

function ResourceName({ children }: { children: ReactNode }) {
  const isScreen = useScreenMediaQuery("lg");

  if (isScreen) {
    return (
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        {children}
      </h1>
    );
  }

  return <ResponsiveSheetTitle>{children}</ResponsiveSheetTitle>;
}

function ResourceHeader({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof ResponsiveSheetHeader>) {
  return (
    <ResponsiveSheetHeader
      className={cn(
        "px-4 flex justify-between items-center flex-row space-x-0 space-y-0 lg:pt-4",
        className
      )}
      {...props}
    >
      {children}
    </ResponsiveSheetHeader>
  );
}

type ResourceActionButtonProps<
  ServerError extends ActionError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<S>,
  CBAVE = BindArgsValidationErrors<BAS>,
  Data = unknown,
> = ComponentPropsWithoutRef<typeof Button> & {
  action: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>;
  actionInputs: z.infer<S>;
  toastProps?: Parameters<typeof toast.promise<Data>>[1];
};

function ResourceActionButton<
  ServerError extends ActionError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<S>,
  CBAVE = BindArgsValidationErrors<BAS>,
  Data = unknown,
>({
  loading = false,
  action,
  actionInputs,
  onClick,
  toastProps,
  ...props
}: ResourceActionButtonProps<ServerError, S, BAS, CVE, CBAVE, Data>) {
  const { executeAsync, isExecuting } = useAction(action);

  return (
    <Button
      type="button"
      {...props}
      loading={loading || isExecuting}
      onClick={(e) => {
        toast.promise(executeAsync(actionInputs).then(unwrap), {
          ...toastProps,
          dismissible: false,
        });
        onClick?.(e);
      }}
    />
  );
}

function ResourceUpdateButton({
  disabled = false,
  loading = false,
  ...props
}: ComponentPropsWithoutRef<typeof Button>) {
  const { formState } = useFormContext();
  const { isDirty, isSubmitting } = formState;

  return (
    <Button
      type="submit"
      size="icon"
      icon={<Upload />}
      {...props}
      disabled={disabled || !isDirty}
      loading={loading || isSubmitting}
    />
  );
}

function useRedirectToProject() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  return useCallback(
    () => router.push(`/projects/${projectId}`),
    [router, projectId]
  );
}

function ResourceCloseButton({
  onClick,
  ...props
}: ComponentPropsWithoutRef<typeof Button>) {
  const redirect = useRedirectToProject();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      icon={<X />}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        redirect();
      }}
    />
  );
}

const ResourceContent = forwardRef<
  ElementRef<typeof ScrollArea>,
  ComponentPropsWithoutRef<typeof ScrollArea>
>(({ className, children, ...props }, ref) => (
  <ScrollArea
    ref={ref}
    className={cn(
      "flex flex-1 flex-col overflow-hidden [&>*]:flex-1 p-2",
      className
    )}
    type="auto"
    overflowMarker
    {...props}
  >
    <div className="px-4 py-2">{children}</div>
  </ScrollArea>
));
ResourceContent.displayName = "ResourceContent";

export {
  Resource,
  ResourceForm,
  ResourceHeader,
  ResourceName,
  ResourceUpdateButton,
  ResourceActionButton,
  ResourceCloseButton,
  ResourceContent,
};
