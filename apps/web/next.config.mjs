/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/", destination: "/projects" }];
  },
};

export default nextConfig;
