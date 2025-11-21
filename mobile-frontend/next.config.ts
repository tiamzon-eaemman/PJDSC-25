import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
import path from 'path';

const runtimeCaching = [
  {
    urlPattern: /^https?:\/\/[^/]+\/evac_centers.*$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'evac-centers-cache',
      expiration: { maxEntries: 50, maxAgeSeconds: 300 },
    },
  },
  {
    urlPattern: /^https?:\/\/[^/]+\/plan.*$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'plan-cache',
      expiration: { maxEntries: 5, maxAgeSeconds: 120 },
    },
  },
  {
    urlPattern: /\/processed_data\/.*\.geojson$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'hazard-geojson-cache',
      expiration: { maxEntries: 10, maxAgeSeconds: 24 * 3600 },
    },
  },
  {
    urlPattern: /\.(?:js|css|woff2?|svg)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-assets',
      expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 },
    },
  },
  {
    urlPattern: /^https?:\/\/[^/]+\/.*$/, 
    handler: 'NetworkFirst',
    options: {
      cacheName: 'others',
      expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      networkTimeoutSeconds: 10,
    },
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig);
