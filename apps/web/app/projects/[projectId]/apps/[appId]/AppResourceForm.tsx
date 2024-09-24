"use client";

import { ResourceForm } from "@/components/resource";
import { PartialAppServiceSchema, TAppService } from "@gws/api-client";
import { ComponentPropsWithoutRef } from "react";

export function AppResourceForm({
  ...props
}: Omit<
  ComponentPropsWithoutRef<typeof ResourceForm>,
  "schema" | "mapResponse"
>) {
  return (
    <ResourceForm
      schema={PartialAppServiceSchema}
      mapResponse={(data) => ({
        ...(data as TAppService),
        publicDomain: {
          subdomain: (data as TAppService).publicDomain ?? "",
        },
      })}
      {...props}
    />
  );
}
