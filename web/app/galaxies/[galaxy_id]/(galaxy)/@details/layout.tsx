import { Layout } from "@/lib/types";

export default function DetailsLayout({ children }: Layout) {
  return <aside className="size-full px-4 pb-6 pt-3">{children}</aside>;
}
