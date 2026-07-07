import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: false,
  swSrc: "worker/index.js",
});

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);
