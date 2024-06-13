import ActionBtn from "@/components/action-btn";
import GenericPlanetForm from "@/components/generic-planet-form";
import StoragePlanetForm from "@/components/storage-planet-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deletePlanet } from "@/lib/actions";
import { api } from "@/lib/api";
import { Page } from "@/lib/types";
import { ApiError } from "api-client";
import { Earth, Trash2 } from "lucide-react";

type PlanetPageProps = Page<{ galaxy_id: string; planet_id: string }>;

export default async function PlanetPage({
  params: { galaxy_id, planet_id },
}: PlanetPageProps) {
  const { data: planet, error: planetError } = await api.GET(
    "/galaxies/{galaxy_id}/planets/{planet_id}",
    {
      params: { path: { galaxy_id, planet_id } },
    }
  );

  if (planetError) {
    throw new ApiError(planetError);
  }

  const { data: stars, error: starsError } = await api.GET(
    "/galaxies/{galaxy_id}/stars",
    {
      params: { path: { galaxy_id } },
    }
  );

  if (starsError) {
    throw new ApiError(starsError);
  }

  return (
    <div className="flex size-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Earth />
          <h1 className="text-2xl font-bold">{planet.name}</h1>
        </div>
        <ActionBtn
          variant="destructive"
          size="icon"
          action={deletePlanet.bind(null, galaxy_id, planet_id)}
        >
          <Trash2 />
        </ActionBtn>
      </header>
      <Tabs defaultValue="generic">
        <TabsList className="w-full">
          <TabsTrigger value="generic" className="flex-1">
            Generic
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex-1">
            Storage
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generic">
          <GenericPlanetForm
            galaxyId={galaxy_id}
            planetId={planet_id}
            stars={stars}
            genericData={{
              name: planet.name,
              star_id: planet.star_id ?? "",
            }}
          />
        </TabsContent>
        <TabsContent value="storage">
          <StoragePlanetForm
            galaxyId={galaxy_id}
            planetId={planet_id}
            storageData={planet}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
