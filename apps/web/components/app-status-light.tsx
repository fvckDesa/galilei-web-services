"use client";

import { AppStatusOptions, useAppStatus } from "@/hooks/app-status";
import { cn } from "@/lib/utils";

export type AppStatusLightProps = AppStatusOptions;

export function AppStatusLight(options: AppStatusLightProps) {
  const {
    status: { available, state },
  } = useAppStatus(options);

  return (
    <div className="flex items-center gap-4 px-2">
      <div className="relative flex size-3">
        <div
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-75",
            available === false && state === "Failed" && "bg-red-400",
            available === true && state === "Failed" && "bg-yellow-400",
            state === "Progressing" && "bg-blue-400",
            state === "Released" && "bg-green-400"
          )}
        />
        <div
          className={cn(
            "relative inline-flex size-3 rounded-full",
            available === false && state === "Failed" && "bg-red-500",
            available === true && state === "Failed" && "bg-yellow-500",
            state === "Progressing" && "bg-blue-500",
            state === "Released" && "bg-green-500",
            state === "Unknown" && "bg-gray-500"
          )}
        />
      </div>
    </div>
  );
}
