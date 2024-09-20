import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/tailwind.config";
import { useMediaQuery } from "react-responsive";

const screens = resolveConfig(tailwindConfig).theme.screens;

export type Screen = keyof typeof screens;

export function useScreenMediaQuery(screen: Screen) {
  return useMediaQuery({
    query: `(width >= ${screens[screen]})`,
  });
}
