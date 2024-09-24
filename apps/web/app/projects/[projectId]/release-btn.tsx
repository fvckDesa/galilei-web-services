"use client";

import { Button } from "@/components/ui/button";
import { GitMerge } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { releaseProject } from "./actions";
import { toast } from "sonner";

interface ReleaseBtnProps {
  projectId: string;
}

export function ReleaseBtn({ projectId }: ReleaseBtnProps) {
  const { execute, isExecuting } = useAction(releaseProject, {
    onSuccess: () => {
      toast.success("Project released");
    },
    onError: ({ error }) => {
      console.error(error);
      toast.error(`Unable to release project`, {
        description: error.serverError?.message,
      });
    },
  });

  return (
    <Button
      icon={<GitMerge />}
      loading={isExecuting}
      onClick={() => execute(projectId)}
    >
      Release
    </Button>
  );
}
