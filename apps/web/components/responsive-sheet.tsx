"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
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

type SheetType = "drawer" | "sheet";

const ResponsiveSheetCtx = createContext<SheetType>("sheet");

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

type IntersectionSheetAndDrawerProps<
  A extends ElementType,
  B extends ElementType,
  C extends CommonPropsWithoutRef<A, B> = CommonPropsWithoutRef<A, B>,
> = ExpandType<
  C & {
    sheetProps?: ExpandType<
      ExclusivePropsWithoutRef<A, B> &
        ("className" extends keyof C ? { className?: string } : object)
    >;
    drawerProps?: ExpandType<
      ExclusivePropsWithoutRef<B, A> &
        ("className" extends keyof C ? { className?: string } : object)
    >;
  }
>;

interface UseResponsiveSheetRenderProps<
  A extends ElementType,
  B extends ElementType,
  C extends CommonPropsWithoutRef<A, B> = CommonPropsWithoutRef<A, B>,
> {
  type: SheetType;
  Sheet: A;
  Drawer: B;
  commonProps: CommonPropsWithoutRef<A, B>;
  sheetProps?:
    | (ExclusivePropsWithoutRef<A, B> &
        ("className" extends keyof C ? { className?: string } : object))
    | undefined;
  drawerProps?:
    | (ExclusivePropsWithoutRef<B, A> &
        ("className" extends keyof C ? { className?: string } : object))
    | undefined;
}

function useResponsiveSheetRender<
  A extends ElementType,
  B extends ElementType,
>({
  type,
  Sheet,
  Drawer,
  commonProps,
  sheetProps,
  drawerProps,
}: UseResponsiveSheetRenderProps<A, B>) {
  return useMemo(() => {
    const Comp = type === "sheet" ? Sheet : Drawer;

    const CLASS_NAME = "className";

    const specificProps = type === "sheet" ? sheetProps : drawerProps;

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
  }, [type, Sheet, Drawer, commonProps, sheetProps, drawerProps]);
}

function useResponsiveSheetRenderFromCtx<
  A extends ElementType,
  B extends ElementType,
>(props: Omit<UseResponsiveSheetRenderProps<A, B>, "type">) {
  const type = useContext(ResponsiveSheetCtx);

  return useResponsiveSheetRender({ ...props, type });
}

export type ResponsiveSheetProps = IntersectionSheetAndDrawerProps<
  typeof Sheet,
  typeof Drawer
> & { screen?: Screen };

function ResponsiveSheet({
  sheetProps,
  drawerProps,
  open,
  onOpenChange,
  defaultOpen,
  screen = "sm",
  ...props
}: ResponsiveSheetProps) {
  const matchScreen = useScreenMediaQuery(screen);

  const [internalOpen, setInternalOpen] = useControlledOpen({
    open,
    onOpen: onOpenChange,
    defaultOpen,
  });

  const type = matchScreen ? "sheet" : "drawer";

  const sheet = useResponsiveSheetRender({
    type,
    Sheet,
    Drawer,
    commonProps: {
      ...props,
      open: internalOpen,
      onOpenChange: setInternalOpen,
    },
    sheetProps,
    drawerProps,
  });

  return (
    <ResponsiveSheetCtx.Provider value={type}>
      {sheet}
    </ResponsiveSheetCtx.Provider>
  );
}
ResponsiveSheet.displayName = "ResponsiveSheet";

export type ResponsiveSheetTriggerProps = IntersectionSheetAndDrawerProps<
  typeof SheetTrigger,
  typeof DrawerTrigger
>;

function ResponsiveSheetTrigger({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetTriggerProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetTrigger,
    Drawer: DrawerTrigger,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetTrigger.displayName = "ResponsiveSheetTrigger";

export type ResponsiveSheetPortalProps = IntersectionSheetAndDrawerProps<
  typeof SheetPortal,
  typeof DrawerPortal
>;

function ResponsiveSheetPortal({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetPortalProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetPortal,
    Drawer: DrawerPortal,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetPortal.displayName = "ResponsiveSheetPortal";

export type ResponsiveSheetCloseProps = IntersectionSheetAndDrawerProps<
  typeof SheetTrigger,
  typeof DrawerTrigger
>;

function ResponsiveSheetClose({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetCloseProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetClose,
    Drawer: DrawerClose,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetClose.displayName = "ResponsiveSheetClose";

export type ResponsiveSheetOverlayProps = IntersectionSheetAndDrawerProps<
  typeof SheetOverlay,
  typeof DrawerOverlay
>;

function ResponsiveSheetOverlay({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetOverlayProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetOverlay,
    Drawer: DrawerOverlay,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetOverlay.displayName = "ResponsiveSheetOverlay";

export type ResponsiveSheetContentProps = IntersectionSheetAndDrawerProps<
  typeof SheetContent,
  typeof DrawerContent
>;

function ResponsiveSheetContent({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetContentProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetContent,
    Drawer: DrawerContent,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetContent.displayName = "ResponsiveSheetContent";

export type ResponsiveSheetHeaderProps = IntersectionSheetAndDrawerProps<
  typeof SheetHeader,
  typeof DrawerHeader
>;

function ResponsiveSheetHeader({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetHeaderProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetHeader,
    Drawer: DrawerHeader,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetHeader.displayName = "ResponsiveSheetHeader";

export type ResponsiveSheetFooterProps = IntersectionSheetAndDrawerProps<
  typeof SheetFooter,
  typeof DrawerFooter
>;

function ResponsiveSheetFooter({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetFooterProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetFooter,
    Drawer: DrawerFooter,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetFooter.displayName = "ResponsiveSheetFooter";

export type ResponsiveSheetTitleProps = IntersectionSheetAndDrawerProps<
  typeof SheetTitle,
  typeof DrawerTitle
>;

function ResponsiveSheetTitle({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetTitleProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetTitle,
    Drawer: DrawerTitle,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetTitle.displayName = "ResponsiveSheetTitle";

export type ResponsiveSheetDescriptionProps = IntersectionSheetAndDrawerProps<
  typeof SheetDescription,
  typeof DrawerDescription
>;

function ResponsiveSheetDescription({
  sheetProps,
  drawerProps,
  ...props
}: ResponsiveSheetDescriptionProps) {
  return useResponsiveSheetRenderFromCtx({
    Sheet: SheetDescription,
    Drawer: DrawerDescription,
    commonProps: props,
    sheetProps,
    drawerProps,
  });
}
ResponsiveSheetDescription.displayName = "ResponsiveSheetDescription";

const ResponsiveSheetNoSsr = dynamic(() => Promise.resolve(ResponsiveSheet), {
  ssr: false,
});

export {
  ResponsiveSheetNoSsr as ResponsiveSheet,
  ResponsiveSheetTrigger,
  ResponsiveSheetPortal,
  ResponsiveSheetClose,
  ResponsiveSheetOverlay,
  ResponsiveSheetContent,
  ResponsiveSheetHeader,
  ResponsiveSheetFooter,
  ResponsiveSheetTitle,
  ResponsiveSheetDescription,
};
