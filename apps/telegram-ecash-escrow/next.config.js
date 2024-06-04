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

