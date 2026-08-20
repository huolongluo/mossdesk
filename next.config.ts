import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run uses the standalone server; Vercel does not.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
};

export default nextConfig;
