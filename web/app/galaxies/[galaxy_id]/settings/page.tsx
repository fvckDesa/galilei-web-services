import ActionBtn from "@/components/action-btn";
import GalaxyForm from "@/components/galaxy-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { deleteGalaxy, updateGalaxy } from "@/lib/actions";
import { api } from "@/lib/api";
import { Page } from "@/lib/types";
import { ApiError } from "api-client";

type GalaxySettingsPageProps = Page<{ galaxy_id: string }>;

export default async function GalaxySettingsPage({
  params: { galaxy_id },
}: GalaxySettingsPageProps) {
  const { data, error } = await api.GET("/galaxies/{galaxy_id}", {
    params: { path: { galaxy_id } },
  });

  if (error) {
    throw new ApiError(error);
  }

  return (
    <div className="flex size-full flex-col items-center gap-6 px-12 py-8">
      <div className="w-full max-w-lg">
        <h1 className="mb-8 text-3xl font-bold">Update Galaxy</h1>
        <GalaxyForm
          action={updateGalaxy.bind(null, galaxy_id)}
          galaxy={data.galaxy}
          btnContent="Update"
        />
      </div>
      <Separator size={2} className="max-w-lg" />
      <div className="w-full max-w-lg">
        <h1 className="mb-8 text-3xl font-bold">Delete Galaxy</h1>
        <Button variant="destructive" className="w-full" asChild>
          <ActionBtn action={deleteGalaxy.bind(null, galaxy_id)}>
            Delete Galaxy
          </ActionBtn>
        </Button>
      </div>
    </div>
  );
}
