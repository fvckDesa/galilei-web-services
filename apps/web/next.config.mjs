import { makeEnvPublic } from "next-runtime-env";

makeEnvPublic(["API_HOST", "HOST_DOMAIN", "HOST_HTTPS_PORT"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/", destination: "/projects" }];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
