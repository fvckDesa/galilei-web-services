"use client";

import { ResourceForm } from "@/components/resource";
import { TAppService } from "@gws/api-client";
import { ComponentPropsWithoutRef } from "react";
import { PartialAppServiceSchemaMod } from "./schema";

export function AppResourceForm({
  ...props
}: Omit<
  ComponentPropsWithoutRef<typeof ResourceForm>,
  "schema" | "mapResponse"
>) {
  return (
    <ResourceForm
      schema={PartialAppServiceSchemaMod}
      mapResponse={(data) => ({
        ...(data as TAppService),
        publicDomain: (data as TAppService).publicDomain ?? "",
      })}
      {...props}
    />
  );
}
