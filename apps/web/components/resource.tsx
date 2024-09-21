"use client";
import {
  ResponsiveSheetDescription,
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
} from "./responsive-sheet";
import {
  ComponentPropsWithoutRef,
  createContext,
  Dispatch,
  ElementRef,
  forwardRef,
  SetStateAction,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useState,
} from "react";
import { ScrollArea } from "./ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { useScreenMediaQuery } from "@/hooks/screen-media-query";
import { Button } from "./ui/button";
import { Trash2, Upload, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { deleteApp } from "@/app/projects/[projectId]/apps/[appId]/actions";
import { toast } from "sonner";
import { FieldValues, FormState } from "react-hook-form";

interface ResourceContextProps<T extends { name: string }> {
  type: string;
  resource: T;
  formState: {
    formId: string;
    isSubmitting: boolean;
    setIsSubmitting: Dispatch<SetStateAction<boolean>>;
    isDirty: boolean;
    setIsDirty: Dispatch<SetStateAction<boolean>>;
  };
}

const ResourceContext = createContext<ResourceContextProps<{
  name: string;
}> | null>(null);

export function useResource<
  T extends { name: string },
>(): ResourceContextProps<T> {
  const ctx = useContext(ResourceContext);

  if (!ctx) {
    throw new Error("Wrap component in Resource component");
  }

  return ctx as ResourceContextProps<T>;
}

export function useResourceState(formState: FormState<FieldValues>) {
  const {
    formState: { formId, setIsDirty, setIsSubmitting },
  } = useResource();

  useLayoutEffect(() => {
    setIsDirty(formState.isDirty);
    setIsSubmitting(formState.isSubmitting);
  }, [formState, setIsDirty, setIsSubmitting]);

  return formId;
}

type ResourceProps<T extends { name: string }> =
  ComponentPropsWithoutRef<"aside"> & {
    type: string;
    resourceSelected: T;
  };

function Resource<T extends { name: string }>({
  type,
  resourceSelected,
  className,
  children,
  ...props
}: ResourceProps<T>) {
  const isScreen = useScreenMediaQuery("lg");
  const formId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(true);

  return (
    <ResourceContext.Provider
      value={{
        type,
        resource: resourceSelected,
        formState: {
          formId,
          isSubmitting,
          setIsSubmitting,
          isDirty,
          setIsDirty,
        },
      }}
    >
      <aside
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
        {!isScreen ? (
          <VisuallyHidden>
            <ResponsiveSheetDescription>
              {type} resource
            </ResponsiveSheetDescription>
          </VisuallyHidden>
        ) : null}
      </aside>
    </ResourceContext.Provider>
  );
}

type ResourceHeaderProps = ComponentPropsWithoutRef<
  typeof ResponsiveSheetHeader
>;

function useRedirectToProject(projectId: string) {
  const router = useRouter();

  return useCallback(
    () => router.push(`/projects/${projectId}`),
    [router, projectId]
  );
}

function ResourceHeader({
  className,
  children,
  ...props
}: ResourceHeaderProps) {
  const {
    type,
    resource,
    formState: { formId, isDirty, isSubmitting },
  } = useResource();
  const { projectId, appId } = useParams<{
    projectId: string;
    appId: string;
  }>();
  const redirect = useRedirectToProject(projectId);
  const { execute, isExecuting } = useAction(deleteApp, {
    onSuccess: () => {
      toast.success(`${type} ${resource.name} successfully deleted`);
      redirect();
    },
    onError: ({ error }) => {
      console.error(error);
      toast.error(`Unable to delete ${type} ${resource.name}`, {
        description: error.serverError?.message,
      });
    },
  });

  return (
    <ResponsiveSheetHeader
      className={cn(
        "px-4 flex justify-between items-center flex-row space-x-0 space-y-0 lg:pt-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">{children}</div>
      <div className="flex gap-2">
        <Button
          form={formId}
          type="submit"
          size="icon"
          disabled={!isDirty}
          loading={isSubmitting}
          icon={<Upload />}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          icon={<Trash2 />}
          loading={isExecuting}
          onClick={() => execute({ projectId, appId })}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          icon={<X />}
          onClick={redirect}
        />
      </div>
    </ResponsiveSheetHeader>
  );
}

type ResourceNameProps = ComponentPropsWithoutRef<"h1">;

function ResourceName({ className, children, ...props }: ResourceNameProps) {
  const isScreen = useScreenMediaQuery("lg");

  if (isScreen) {
    return (
      <h1
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h1>
    );
  }

  return (
    <ResponsiveSheetTitle className={className} {...props}>
      {children}
    </ResponsiveSheetTitle>
  );
}

const ResourceContent = forwardRef<
  ElementRef<typeof ScrollArea>,
  ComponentPropsWithoutRef<typeof ScrollArea>
>(({ className, ...props }, ref) => (
  <ScrollArea
    ref={ref}
    className={cn(
      "flex flex-1 flex-col overflow-hidden [&>*]:flex-1 px-4 py-2",
      className
    )}
    overflowMarker
    {...props}
  />
));
ResourceContent.displayName = "ResourceContent";

export { Resource, ResourceHeader, ResourceName, ResourceContent };
