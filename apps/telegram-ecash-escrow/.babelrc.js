const path = require('path');
module.exports = {
  presets: [
    'next/babel',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        treeshakeCompensation: true,
        aliases: {
          '@/*': [path.join(__dirname, 'src', '*')],
        },
        genConditionalClasses: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    ],
    '@babel/plugin-transform-modules-commonjs',
  ],
};