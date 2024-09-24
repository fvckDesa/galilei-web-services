import { makeEnvPublic } from "next-runtime-env";

makeEnvPublic(["API_HOST", "HOST_DOMAIN", "HOST_HTTPS_PORT"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/", destination: "/projects" }];
  },
};

export default nextConfig;
