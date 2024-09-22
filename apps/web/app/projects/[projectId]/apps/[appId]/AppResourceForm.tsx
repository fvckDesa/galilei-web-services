"use client";

import { ResourceForm } from "@/components/resource";
import { PartialAppServiceSchema } from "@gws/api-client";
import { ComponentPropsWithoutRef } from "react";

export function AppResourceForm({
  ...props
}: Omit<ComponentPropsWithoutRef<typeof ResourceForm>, "schema">) {
  return <ResourceForm schema={PartialAppServiceSchema} {...props} />;
}
