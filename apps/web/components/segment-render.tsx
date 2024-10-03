"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";

export interface RenderSegmentProps {
  segment?: string | null;
  parallelRouteKey?: string;
  children: ReactNode;
}

export function RenderSegment({
  segment = null,
  parallelRouteKey,
  children,
}: RenderSegmentProps) {
  const currentSegment = useSelectedLayoutSegment(parallelRouteKey);

  if (currentSegment === segment) {
    return children;
  }

  return null;
}
