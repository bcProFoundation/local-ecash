/** @type {import('next').NextConfig} */
const path = require('path');
const webpack = require('webpack');
const stylexPlugin = require('@stylexjs/nextjs-plugin');
const babelrc = require('./.babelrc.js');
const plugins = babelrc.plugins;
const [_name, options] = plugins.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === '@stylexjs/babel-plugin'
  );

const rootDir = options.unstable_moduleResolution.rootDir ?? __dirname;
const aliases = options.aliases ?? undefined;
const useCSSLayers = options.useCSSLayers?? undefined;

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['@stylexjs/open-props', '@bcpros/redux-store'],
  webpack(config, { defaultLoaders, isServer }) {
		config.resolve.alias = {
			...config.resolve.alias,
      "@nestjs/graphql": path.resolve(__dirname, "node_modules/@nestjs/graphql/dist/extra/graphql-model-shim"),
			'@store': path.resolve(__dirname, path.resolve('node_modules/@bcpros/redux-store/src/store')),
			'@hooks': path.resolve(__dirname, path.resolve('node_modules/@bcpros/redux-store/src/hooks')),
			'@utils': path.resolve(__dirname, path.resolve('node_modules/@bcpros/redux-store/src/utils')),
			'@context': path.resolve(__dirname, path.resolve('node_modules/@bcpros/redux-store/src/context')),
		};
    return config;
  },
  experimental: {
    enableShaking: true,
    optimizePackageImports: ['@bcpros/lixi-models', '@bcpros/redux-store']
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

module.exports = stylexPlugin({
  aliases,
  useCSSLayers,
  filename: 'stylex-bundle.css',
  rootDir
})(config);

