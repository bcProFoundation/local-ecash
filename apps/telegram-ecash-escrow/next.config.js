/** @type {import('next').NextConfig} */
const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['@bcpros/redux-store'],
  webpack(config, { defaultLoaders, isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@store': path.resolve(__dirname, "node_modules/@bcpros/redux-store"),
      '@bcpros/redux-store': path.resolve(__dirname, "node_modules/@bcpros/redux-store"),
      "@nestjs/graphql": path.resolve(__dirname, "node_modules/@nestjs/graphql/dist/extra/graphql-model-shim"),
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "tls": false,
        "tty": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "stream": false,
        "crypto": false,
        "async_hooks": false,
        "child_process": false
      }
    }
    return config;
  },
  experimental: {
    esmExternals: "loose",
    // optimizePackageImports: ['@bcpros/lixi-models', '@bcpros/redux-store']
    optimizePackageImports: ['@bcpros/redux-store']
  }
};

const config = nextConfig;


if (process.env.ANALYZE === 'true') {
  // @ts-ignore
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  config = withBundleAnalyzer(config);
}

module.exports = config;
