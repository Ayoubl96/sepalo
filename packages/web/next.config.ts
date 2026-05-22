import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@sepalo/core'],
  webpack: (config) => {
    // pnpm uses symlinks for workspace packages; disabling symlink resolution
    // prevents webpack from creating chunk references that break in dev mode.
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
