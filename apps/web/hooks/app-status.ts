"use client";

import { useEffect, useState } from "react";
import {
  EventSourcePolyfill,
  MessageEvent,
  Event,
} from "event-source-polyfill";
import { env } from "next-runtime-env";
import { AppStatus, TAppStatus } from "@gws/api-client";

const API_HOST = env("NEXT_PUBLIC_API_HOST") ?? "http://localhost:8000";

const UNKNOWN_DEFAULT_STATE: TAppStatus = {
  available: false,
  state: "Unknown",
};

export interface AppStatusOptions {
  project: string;
  app: string;
  token: string;
}

export function useAppStatus({ app, project, token }: AppStatusOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<TAppStatus>(UNKNOWN_DEFAULT_STATE);

  useEffect(() => {
    const eventSource = new EventSourcePolyfill(
      `${API_HOST}/projects/${project}/apps/${app}/status`,
      {
        headers: {
          "X-Api-Key": token,
        },
        heartbeatTimeout: 15 * 60 * 1000, // reconnect after 15 min
      }
    );

    function handleOpen() {
      setIsOpen(true);
    }

    function handleMessage(e: MessageEvent) {
      const { success, data } = AppStatus.safeParse(JSON.parse(e.data));
      setStatus(success ? data : UNKNOWN_DEFAULT_STATE);
    }

    function handleError(e: Event) {
      console.error(e);
    }

    eventSource.addEventListener("open", handleOpen);
    eventSource.addEventListener("message", handleMessage);
    eventSource.addEventListener("error", handleError);

    return () => {
      eventSource.removeEventListener("open", handleOpen);
      eventSource.removeEventListener("message", handleMessage);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
      setIsOpen(false);
    };
  }, [app, project, token, setIsOpen]);

  return { status, isOpen };
}
