"use client";
import { useCallback, useEffect, useState } from "react";

export interface UseControlledOpenProps {
  open?: boolean | undefined;
  onOpen?: ((open: boolean) => void) | undefined;
  defaultOpen?: boolean | undefined;
}

export function useControlledOpen({
  open,
  onOpen,
  defaultOpen = false,
}: UseControlledOpenProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  useEffect(() => {
    if (open != undefined) {
      setInternalOpen(open);
    }
  }, [open]);

  const onInternalOpen = useCallback(
    (open: boolean) => (onOpen ? onOpen(open) : setInternalOpen(open)),
    [onOpen, setInternalOpen]
  );

  return [internalOpen, onInternalOpen] as const;
}
