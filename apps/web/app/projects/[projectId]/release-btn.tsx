"use client";

import { Button } from "@/components/ui/button";
import { GitMerge } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { releaseProject } from "./actions";

interface ReleaseBtnProps {
  projectId: string;
}

export function ReleaseBtn({ projectId }: ReleaseBtnProps) {
  const { execute, isExecuting } = useAction(releaseProject);

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
