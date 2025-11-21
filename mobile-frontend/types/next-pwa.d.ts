declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  type PwaConfig = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    runtimeCaching?: any[];
  };
  export default function withPWA(pwaConfig: PwaConfig): (nextConfig: NextConfig) => NextConfig;
}
