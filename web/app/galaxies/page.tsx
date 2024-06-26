import Resource from "@/components/resource";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { ApiError } from "api-client";
import { Orbit, Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galaxies",
  description: "Your galaxies",
};

export default async function Galaxies() {
  const { data: galaxies, error } = await api.GET("/galaxies");

  if (error) {
    throw new ApiError(error);
  }

  return (
    <div className="flex size-full flex-col gap-6 px-12 pb-9 pt-12">
      <header className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Your Galaxies</h1>
        <Button className="flex gap-2 self-end" asChild>
          <Link href="/galaxies/new">
            <Plus className="size-4" />
            <span>New Galaxy</span>
          </Link>
        </Button>
      </header>
      <ScrollArea className="flex-1" type="auto">
        <ul className="grid grid-cols-fluid gap-x-4 gap-y-6 p-4">
          {galaxies.map(({ id, name }) => (
            <li key={id} className="w-full">
              <Resource href={`/galaxies/${id}`}>
                <Orbit />
                <span>{name}</span>
              </Resource>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
