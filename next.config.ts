import type { NextConfig } from "next"

const isMobileBuild = process.env.MOBILE_BUILD === "true"

const nextConfig: NextConfig = {
  // Static export for Capacitor mobile build
  ...(isMobileBuild && {
    output: "export",
    images: { unoptimized: true },
  }),

  compress: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ]
  },
}

export default nextConfig
