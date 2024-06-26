import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { PublicEnvScript } from "next-runtime-env";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Galilei Web Services",
  description: "Galilei Web Services is an infrastructure for app hosting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body className={cn(inter.className, "w-screen h-screen")}>
        {children}
      </body>
    </html>
  );
}
