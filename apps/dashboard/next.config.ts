import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vendorly/convex", "@vendorly/ui", "@vendorly/utils"],
};

export default nextConfig;

