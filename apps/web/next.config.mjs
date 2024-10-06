import { makeEnvPublic } from "next-runtime-env";

makeEnvPublic([
  "API_BASE_URL",
  "HOST_PUBLIC_DOMAIN",
  "HOST_PUBLIC_PORT",
  "HOST_PRIVATE_DOMAIN",
  "WEB_HOST_DOMAIN",
]);

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
