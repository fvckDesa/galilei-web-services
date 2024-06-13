import { api } from "@/lib/api";
import Resource from "./resource";
import { Earth, Orbit, Star as StarIcon, Settings } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import Link from "next/link";
import { ApiError } from "api-client";
import NewResourceBtn from "./new-resource-btn";

interface GalaxyProps {
  galaxy_id: string;
}

export default async function Galaxy({ galaxy_id }: GalaxyProps) {
  const { data, error } = await api.GET("/galaxies/{galaxy_id}", {
    params: { path: { galaxy_id } },
    next: { tags: ["galaxy"] },
  });

  if (error) {
    throw new ApiError(error);
  }

  const { galaxy, stars, planets } = data;

  return (
    <main className="flex flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between gap-4">
        <Orbit />
        <h1 className="flex-1 overflow-hidden text-ellipsis text-nowrap text-2xl font-bold">
          {galaxy.name}
        </h1>
        <NewResourceBtn galaxyId={galaxy.id} stars={stars} />
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/galaxies/${galaxy.id}/settings`}>
            <Settings />
          </Link>
        </Button>
      </header>
      <ScrollArea className="flex-1" type="auto">
        <div>
          <h2 className="text-xl font-bold">Stars</h2>
          <ul className="grid grid-cols-fluid gap-x-4 gap-y-6 p-4">
            {stars.map(({ id, name }) => (
              <li key={id} className="w-full">
                <Resource href={`/galaxies/${galaxy_id}/stars/${id}`}>
                  <StarIcon />
                  <span>{name}</span>
                </Resource>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold">Planets</h2>
          <ul className="grid grid-cols-fluid gap-x-4 gap-y-6 p-4">
            {planets.map(({ id, name }) => (
              <li key={id} className="w-full">
                <Resource href={`/galaxies/${galaxy_id}/planets/${id}`}>
                  <Earth />
                  <span>{name}</span>
                </Resource>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </main>
  );
}
