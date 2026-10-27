import type { NextConfig } from "next";

// STATIC_EXPORT=1 npm run build  →  plain static site in ./out (for any static host)
const isExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: "export", images: { unoptimized: true } } : {}),
};

export default nextConfig;
