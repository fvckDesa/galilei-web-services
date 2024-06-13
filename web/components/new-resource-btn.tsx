"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import NewStarForm from "./new-star-form";
import NewPlanetForm from "./new-planet-form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Earth, Plus, Star as StarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Star } from "@/lib/schema";
import { ScrollArea } from "./ui/scroll-area";

export interface NewResourceBtnProps {
  galaxyId: string;
  stars: Star[];
}

type DialogType = "star" | "planet";

export default function NewResourceBtn({
  galaxyId,
  stars,
}: NewResourceBtnProps) {
  const [dialogType, setDialogType] = useState<DialogType>("star");
  const [isOpen, setIsOpen] = useState(false);

  function changeDialogType(type: DialogType) {
    return function () {
      setDialogType(type);
    };
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            <span>New</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-2">
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2"
              onClick={changeDialogType("star")}
            >
              <StarIcon className="size-4" />
              <span>New Star</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2"
              onClick={changeDialogType("planet")}
            >
              <Earth className="size-4" />
              <span>New Planet</span>
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogType === "star" ? (
        <DialogContent className="h-5/6 w-11/12 rounded-lg px-2">
          <DialogHeader className="px-4">
            <DialogTitle>New Star</DialogTitle>
          </DialogHeader>
          <ScrollArea type="auto" overflowMarker>
            <NewStarForm
              galaxyId={galaxyId}
              afterSubmit={() => setIsOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      ) : (
        <DialogContent className="h-5/6 w-11/12 rounded-lg px-2">
          <DialogHeader className="px-4">
            <DialogTitle>New Planet</DialogTitle>
          </DialogHeader>
          <NewPlanetForm
            galaxyId={galaxyId}
            stars={stars}
            afterSubmit={() => setIsOpen(false)}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}
