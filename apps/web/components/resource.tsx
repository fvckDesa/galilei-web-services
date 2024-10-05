"use client";

import {
  ComponentPropsWithoutRef,
  createContext,
  ElementRef,
  forwardRef,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Schema, z } from "zod";
import { BindArgsValidationErrors, ValidationErrors } from "next-safe-action";
import { ActionError, cn, unwrap } from "@/lib/utils";
import { HookSafeActionFn, useAction } from "next-safe-action/hooks";
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
import { createPortal } from "react-dom";
import { ResponsiveDialogClose } from "./responsive-dialog";

interface ResourceContextProps<T = unknown> {
  container: RefObject<HTMLDivElement>;
  resource: T;
}

const ResourceContext = createContext<ResourceContextProps | null>(null);

export function useResource<T>(): ResourceContextProps<T> {
  const ctx = useContext(ResourceContext);

  if (!ctx) {
    throw new Error("Wrap Resource sub-components in Resource component");
  }

  return ctx as ResourceContextProps<T>;
}

function Resource<T = unknown>({
  currentResource,
  className,
  ...props
}: ComponentPropsWithoutRef<"aside"> & { currentResource: T }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ResourceContext.Provider
      value={{ container: containerRef, resource: currentResource }}
    >
      <aside
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden",
          className
        )}
        {...props}
      />
    </ResourceContext.Provider>
  );
}

function ResourceName({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const isScreen = useScreenMediaQuery("lg");

  if (isScreen) {
    return (
      <h1
        className={cn(
          "text-lg font-semibold leading-none tracking-tight text-left",
          className
        )}
      >
        {children}
      </h1>
    );
  }

  return (
    <ResponsiveSheetTitle className={cn("text-left", className)}>
      {children}
    </ResponsiveSheetTitle>
  );
}

function ResourceHeader({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof ResponsiveSheetHeader>) {
  return (
    <ResponsiveSheetHeader
      className={cn(
        "px-4 flex justify-between items-center gap-2 flex-row space-x-0 space-y-0 lg:pt-4",
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
        toast.promise(executeAsync(actionInputs).then(unwrap), toastProps);
        onClick?.(e);
      }}
    />
  );
}

function ResourceUpdateButtonContainer({
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const { container } = useResource();

  return <div ref={container} {...props} />;
}

function ResourceUpdateButton({
  ...props
}: ComponentPropsWithoutRef<typeof Button>) {
  const { container } = useResource();
  const [currentContainer, setCurrentContainer] =
    useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    setCurrentContainer(container.current);
  }, [container]);

  if (!currentContainer) {
    return null;
  }

  return createPortal(
    <Button type="submit" size="icon" icon={<Upload />} {...props} />,
    currentContainer
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
  const isScreen = useScreenMediaQuery("lg");

  if (isScreen) {
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

  return (
    <ResponsiveDialogClose asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        icon={<X />}
        {...props}
      />
    </ResponsiveDialogClose>
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
  ResourceHeader,
  ResourceName,
  ResourceUpdateButtonContainer,
  ResourceUpdateButton,
  ResourceActionButton,
  ResourceCloseButton,
  ResourceContent,
};
