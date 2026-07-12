import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/isomorphic-fetch",
    "@libsql/isomorphic-ws",
    "@libsql/hrana-client",
    "@prisma/adapter-libsql",
    "cloudinary",
  ],
};

export default nextConfig;
