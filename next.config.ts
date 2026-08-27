import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker uses standalone output, while Vercel packages native Next.js output.
  ...(process.env.VERCEL === '1' ? {} : { output: 'standalone' }),
};

export default nextConfig;
