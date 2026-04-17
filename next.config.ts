import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    'drizzle-kit',
    'esbuild',
    'esbuild-register',
    '@esbuild/linux-x64',
    '@libsql/linux-x64-gnu',
    '@libsql/linux-arm64-gnu',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cointelligence.com').hostname,
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
    ],
  },
};

export default withPayload(nextConfig)
