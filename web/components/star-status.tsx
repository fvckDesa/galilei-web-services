"use client";

import { StarStatus as StarStatusType } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface StarStatusProps {
  galaxy_id: string;
  star_id: string;
  withLabel?: boolean;
}

type StarStatusState = StarStatusType["status"] | "Unknown";

export default function StarStatus({
  galaxy_id,
  star_id,
  withLabel = false,
}: StarStatusProps) {
  const [status, setStatus] = useState<StarStatusState>("Unknown");

  useEffect(() => {
    const evtSource = new EventSource(
      `http://localhost:8080/galaxies/${galaxy_id}/stars/${star_id}?watch=true`,
      { withCredentials: true }
    );

    function generateStatusState(e: MessageEvent<string>) {
      const { status } = JSON.parse(e.data) as StarStatusType;
      // max replicas value is 1 for now
      setStatus(status);
    }

    function handleError() {
      console.error("An error occurred while attempting to connect.");
    }

    evtSource.addEventListener("status", generateStatusState);
    evtSource.addEventListener("error", handleError);

    return () => {
      evtSource.removeEventListener("status", generateStatusState);
      evtSource.removeEventListener("error", handleError);
      evtSource.close();
    };
  }, [galaxy_id, star_id]);

  return (
    <div className="flex items-center gap-4 px-2">
      <div className="relative flex size-3">
        <div
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-75",
            status === "Failure" && "bg-red-400",
            status === "Active" && "bg-green-400"
          )}
        />
        <div
          className={cn(
            "relative inline-flex size-3 rounded-full",
            status === "Unknown" && "bg-gray-500",
            status === "Failure" && "bg-red-500",
            status === "Active" && "bg-green-500"
          )}
        />
      </div>
      {withLabel ? <span>{status}</span> : null}
    </div>
  );
}
