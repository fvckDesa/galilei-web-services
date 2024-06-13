import { Layout } from "@/lib/types";
import InfrastructureImage from "@/images/infrastructure.svg";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AuthLayout({ children }: Layout) {
  return (
    <div className="grid size-full grid-cols-1 md:grid-cols-2">
      <ScrollArea type="auto" className="size-full">
        <main className="size-full px-8 py-10">{children}</main>
      </ScrollArea>
      <div className="hidden items-center justify-center bg-primary/20 px-3 py-4 md:flex">
        <Image
          src={InfrastructureImage.src}
          alt="infrastructure illustration"
          width={InfrastructureImage.width}
          height={InfrastructureImage.height}
        />
      </div>
    </div>
  );
}
