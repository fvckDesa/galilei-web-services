"use client";

import { useTransition } from "react";
import { Button } from "./ui/button";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  message?: string;
  className?: string;
  disabled?: boolean;
}

export default function CopyButton({
  text,
  message = "Copied",
  className,
  disabled = false,
}: CopyButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      loading={isPending}
      onClick={handleClick}
      disabled={disabled}
      icon={<ClipboardCopy />}
    ></Button>
  );
}
