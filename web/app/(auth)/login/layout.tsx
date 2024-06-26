import { Layout } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login into galilei web services",
};

export default function AuthLayout({ children }: Layout) {
  return children;
}
