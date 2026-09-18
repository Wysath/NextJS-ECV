import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Wikimedia is deliberately absent: its images use a custom loader that bypasses the optimizer
    remotePatterns: [
      new URL("https://images.metmuseum.org/CRDImages/**"),
      // MoMA media URLs carry a ?sha= cache key, so the query string must stay unrestricted
      { protocol: "https", hostname: "www.moma.org", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
