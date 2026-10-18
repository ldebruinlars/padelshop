import type { NextConfig } from "next";

// Volledig statische site: `npm run build` schrijft naar out/, dat Netlify publiceert.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
