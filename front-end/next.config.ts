import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load env from repo root (one level up from front-end)
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
