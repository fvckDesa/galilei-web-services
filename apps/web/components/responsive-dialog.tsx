"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import {
  createContext,
  useContext,
  ComponentPropsWithoutRef,
  ElementType,
  useMemo,
} from "react";
import { ExpandType } from "@/lib/types";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Screen, useScreenMediaQuery } from "@/hooks/screen-media-query";
import { useControlledOpen } from "@/hooks/controlled-open";

type DialogType = "drawer" | "dialog";

const ResponsiveDialogCtx = createContext<DialogType>("dialog");

type Common<A, B> = Pick<
  A,
  keyof {
    [K in keyof A & keyof B]: A[K] extends B[K]
      ? B[K] extends A[K]
        ? A[K] // A[K] and B[K] are the same type
        : B[K] // A[K] is a subtype of B[K]
      : Common<A[K], B[K]>; // A[K] and B[K] are not the same type, recurse
  }
>;

type CommonPropsWithoutRef<
  A extends ElementType,
  B extends ElementType,
> = Common<ComponentPropsWithoutRef<A>, ComponentPropsWithoutRef<B>>;

type ExclusivePropsWithoutRef<
  A extends ElementType,
  B extends ElementType,
> = Omit<ComponentPropsWithoutRef<A>, keyof ComponentPropsWithoutRef<B>>;

type IntersectionDialogAndDrawerProps<
  A extends ElementType,
  B extends ElementType,
  C extends CommonPropsWithoutRef<A, B> = CommonPropsWithoutRef<A, B>,
> = ExpandType<
  C & {
    dialogProps?: ExpandType<
      ExclusivePropsWithoutRef<A, B> &
        ("className" extends keyof C ? { className?: string } : object)
    >;
    drawerProps?: ExpandType<
      ExclusivePropsWithoutRef<B, A> &
        ("className" extends keyof C ? { className?: string } : object)
    >;
  }
>;

interface UseResponsiveDialogRenderProps<
  A extends ElementType,
  B extends ElementType,
  C extends CommonPropsWithoutRef<A, B> = CommonPropsWithoutRef<A, B>,
> {
  type: DialogType;
  Dialog: A;
  Drawer: B;
  commonProps: CommonPropsWithoutRef<A, B>;
  dialogProps?:
    | (ExclusivePropsWithoutRef<A, B> &
        ("className" extends keyof C ? { className?: string } : object))
    | undefined;
  drawerProps?:
    | (ExclusivePropsWithoutRef<B, A> &
        ("className" extends keyof C ? { className?: string } : object))
    | undefined;
}

function useResponsiveDialogRender<
  A extends ElementType,
  B extends ElementType,
>({
  type,
  Dialog,
  Drawer,
  commonProps,
  dialogProps,
  drawerProps,
}: UseResponsiveDialogRenderProps<A, B>) {
  return useMemo(() => {
    const Comp = type === "dialog" ? Dialog : Drawer;

    const CLASS_NAME = "className";

    const specificProps = type === "dialog" ? dialogProps : drawerProps;

    const props = {
      ...commonProps,
      ...specificProps,
      className: cn(
        Object.hasOwn(commonProps, CLASS_NAME)
          ? commonProps.className
          : undefined,
        specificProps && Object.hasOwn(specificProps, CLASS_NAME)
          ? (specificProps as { className: string }).className
          : undefined
      ),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Comp {...(props as any)} />;
  }, [type, Dialog, Drawer, commonProps, dialogProps, drawerProps]);
}

function useResponsiveDialogRenderFromCtx<
  A extends ElementType,
  B extends ElementType,
>(props: Omit<UseResponsiveDialogRenderProps<A, B>, "type">) {
  const type = useContext(ResponsiveDialogCtx);

  return useResponsiveDialogRender({ ...props, type });
}

export type ResponsiveDialogProps = IntersectionDialogAndDrawerProps<
  typeof Dialog,
  typeof Drawer
> & { screen?: Screen };

function ResponsiveDialog({
  dialogProps,
  drawerProps,
  open,
  onOpenChange,
  defaultOpen,
  screen = "sm",
  ...props
}: ResponsiveDialogProps) {
  const matchScreen = useScreenMediaQuery(screen);

  const [internalOpen, setInternalOpen] = useControlledOpen({
    open,
    onOpen: onOpenChange,
    defaultOpen,
  });

  const type = matchScreen ? "dialog" : "drawer";

  const dialog = useResponsiveDialogRender({
    type,
    Dialog,
    Drawer,
    commonProps: {
      ...props,
      open: internalOpen,
      onOpenChange: setInternalOpen,
    },
    dialogProps,
    drawerProps,
  });

  return (
    <ResponsiveDialogCtx.Provider value={type}>
      {dialog}
    </ResponsiveDialogCtx.Provider>
  );
}
ResponsiveDialog.displayName = "ResponsiveDialog";

export type ResponsiveDialogTriggerProps = IntersectionDialogAndDrawerProps<
  typeof DialogTrigger,
  typeof DrawerTrigger
>;

function ResponsiveDialogTrigger({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogTriggerProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogTrigger,
    Drawer: DrawerTrigger,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogTrigger.displayName = "ResponsiveDialogTrigger";

export type ResponsiveDialogPortalProps = IntersectionDialogAndDrawerProps<
  typeof DialogPortal,
  typeof DrawerPortal
>;

function ResponsiveDialogPortal({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogPortalProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogPortal,
    Drawer: DrawerPortal,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogPortal.displayName = "ResponsiveDialogPortal";

export type ResponsiveDialogCloseProps = IntersectionDialogAndDrawerProps<
  typeof DialogTrigger,
  typeof DrawerTrigger
>;

function ResponsiveDialogClose({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogCloseProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogClose,
    Drawer: DrawerClose,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogClose.displayName = "ResponsiveDialogClose";

export type ResponsiveDialogOverlayProps = IntersectionDialogAndDrawerProps<
  typeof DialogOverlay,
  typeof DrawerOverlay
>;

function ResponsiveDialogOverlay({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogOverlayProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogOverlay,
    Drawer: DrawerOverlay,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogOverlay.displayName = "ResponsiveDialogOverlay";

export type ResponsiveDialogContentProps = IntersectionDialogAndDrawerProps<
  typeof DialogContent,
  typeof DrawerContent
>;

function ResponsiveDialogContent({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogContentProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogContent,
    Drawer: DrawerContent,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogContent.displayName = "ResponsiveDialogContent";

export type ResponsiveDialogHeaderProps = IntersectionDialogAndDrawerProps<
  typeof DialogHeader,
  typeof DrawerHeader
>;

function ResponsiveDialogHeader({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogHeaderProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogHeader,
    Drawer: DrawerHeader,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader";

export type ResponsiveDialogFooterProps = IntersectionDialogAndDrawerProps<
  typeof DialogFooter,
  typeof DrawerFooter
>;

function ResponsiveDialogFooter({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogFooterProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogFooter,
    Drawer: DrawerFooter,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter";

export type ResponsiveDialogTitleProps = IntersectionDialogAndDrawerProps<
  typeof DialogTitle,
  typeof DrawerTitle
>;

function ResponsiveDialogTitle({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogTitleProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogTitle,
    Drawer: DrawerTitle,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogTitle.displayName = "ResponsiveDialogTitle";

export type ResponsiveDialogDescriptionProps = IntersectionDialogAndDrawerProps<
  typeof DialogDescription,
  typeof DrawerDescription
>;

function ResponsiveDialogDescription({
  dialogProps,
  drawerProps,
  ...props
}: ResponsiveDialogDescriptionProps) {
  return useResponsiveDialogRenderFromCtx({
    Dialog: DialogDescription,
    Drawer: DrawerDescription,
    commonProps: props,
    dialogProps,
    drawerProps,
  });
}
ResponsiveDialogDescription.displayName = "ResponsiveDialogDescription";

const ResponsiveDialogNoSsr = dynamic(() => Promise.resolve(ResponsiveDialog), {
  ssr: false,
});

export {
  ResponsiveDialogNoSsr as ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogPortal,
  ResponsiveDialogClose,
  ResponsiveDialogOverlay,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
};
