import StarStatus from "@/components/star-status";
import ActionBtn from "@/components/action-btn";
import EnvStarForm from "@/components/env-star-form";
import GenericStarForm from "@/components/generic-star-form";
import NetworkStarForm from "@/components/network-star-form";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteStar, deleteStarVariable } from "@/lib/actions";
import { api } from "@/lib/api";
import { Star } from "@/lib/schema";
import { Page } from "@/lib/types";
import { ApiError } from "api-client";
import { Star as StarIcon, Trash2, X } from "lucide-react";

type StarPageProps = Page<{ galaxy_id: string; star_id: string }>;

export default async function StarPage({
  params: { galaxy_id, star_id },
}: StarPageProps) {
  const { data, error } = await api.GET(
    "/galaxies/{galaxy_id}/stars/{star_id}",
    {
      params: { path: { galaxy_id, star_id } },
      headers: new Headers({ "Content-Type": "application/json" }),
    }
  );

  // TODO improve type checking at runtime
  // the star type is returned by 'Content-Type': 'application/json' header
  const star = data as Star;

  if (error) {
    throw new ApiError(error);
  }

  const { data: vars, error: varError } = await api.GET(
    "/galaxies/{galaxy_id}/stars/{star_id}/vars",
    {
      params: { path: { galaxy_id, star_id } },
      next: {
        tags: ["enviroment"],
      },
    }
  );

  if (varError) {
    throw new ApiError(varError);
  }

  return (
    <div className="flex size-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StarIcon />
          <h1 className="text-2xl font-bold">{star.name}</h1>
        </div>
        <ActionBtn
          variant="destructive"
          size="icon"
          action={deleteStar.bind(null, galaxy_id, star_id)}
        >
          <Trash2 />
        </ActionBtn>
      </header>
      <StarStatus galaxy_id={galaxy_id} star_id={star_id} withLabel />
      <Tabs className="flex w-full flex-1 flex-col" defaultValue="generic">
        <TabsList className="w-full">
          <TabsTrigger value="generic" className="flex-1">
            Generic
          </TabsTrigger>
          <TabsTrigger value="network" className="flex-1">
            Network
          </TabsTrigger>
          <TabsTrigger value="enviroment" className="flex-1">
            Enviroment
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generic">
          <GenericStarForm
            galaxyId={galaxy_id}
            starId={star_id}
            genericData={star}
          />
        </TabsContent>
        <TabsContent value="network">
          <NetworkStarForm
            galaxyId={galaxy_id}
            starId={star_id}
            networkData={{
              ...star,
              public_domain: star.public_domain ?? "",
              private_domain: star.private_domain ?? "",
            }}
          />
        </TabsContent>
        <TabsContent value="enviroment" className="flex w-full flex-1 flex-col">
          <EnvStarForm galaxyId={galaxy_id} starId={star_id} vars={vars} />
          <ul className="flex w-full flex-1 flex-col gap-2">
            {vars.map(({ id, name, value, star_id }) => (
              <li
                key={id}
                className="flex w-full items-center justify-between gap-4 px-2 py-1"
              >
                <ScrollArea className="flex-1 px-2 py-1">
                  <span className="text-nowrap">{name}</span>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <ScrollArea className="flex-1 px-2 py-1">
                  <span className="text-nowrap">{value}</span>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <ActionBtn
                  variant="destructive"
                  size="icon"
                  className="size-6 *:size-4"
                  action={deleteStarVariable.bind(null, galaxy_id, star_id, id)}
                >
                  <X />
                </ActionBtn>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
