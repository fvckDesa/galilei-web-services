import GalaxyForm from "@/components/galaxy-form";
import { newGalaxy } from "@/lib/actions";

export default async function NewGalaxyPage() {
  return (
    <main className="flex size-full flex-col items-center gap-6 px-8 py-12 ">
      <header className="w-full max-w-lg">
        <h1 className="mb-2 text-3xl font-bold">Create Galaxy</h1>
        <p className="font-semibold text-muted-foreground">
          A Galaxy is a virtual network where access from the outside is limited
          to specific components of the network
        </p>
      </header>
      <GalaxyForm action={newGalaxy} btnContent="Create" />
    </main>
  );
}
