"use client";

import { EnvForm } from "./components/env-form";
import { ResourceContent, useResource } from "@/components/resource";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TAppService } from "@gws/api-client";

export default function EnvLayout({
  params: { projectId, appId },
  children,
}: {
  children: ReactNode;
  params: { projectId: string; appId: string };
}) {
  const [formOpen, setFormOpen] = useState(false);
  const { resource: app } = useResource<TAppService>();

  function closeForm() {
    setFormOpen(false);
  }

  return (
    <>
      <div className="px-4 py-2">
        {formOpen && !app.deleted ? (
          <EnvForm
            projectId={projectId}
            appId={appId}
            onAdd={closeForm}
            onCancel={closeForm}
          />
        ) : (
          <div className="flex items-center justify-between px-2">
            <h1 className="text-lg font-semibold">Environment Variables</h1>
            <Button
              icon={<Plus />}
              disabled={app.deleted}
              onClick={() => setFormOpen(true)}
            >
              New
            </Button>
          </div>
        )}
      </div>
      <ResourceContent className="[&>div>div[style]]:!block">
        {children}
      </ResourceContent>
    </>
  );
}
