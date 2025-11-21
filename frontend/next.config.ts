// @ts-nocheck
import type { NextConfig } from "next"
import withPWA from "next-pwa"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  turbopack: {}
}

const runtimeCaching: any = [
  {
    urlPattern: /\/plan$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'plan-cache',
      expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 },
    },
  },
  {
    urlPattern: /\/evac_centers$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'centers-cache',
      expiration: { maxEntries: 1, maxAgeSeconds: 60 * 10 },
    },
  },
  {
    // Limit tile caching to OSM basic tiles; respect usage policy (do not bulk prefetch)
    urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\//,
    handler: 'CacheFirst',
    options: {
      cacheName: 'osm-tiles',
      expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
]

// Cast to any to avoid NextConfig type mismatches between next-pwa bundled types and local next version.
export default (withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
}) as any)(nextConfig as any)
