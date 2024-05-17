const path = require('path');
module.exports = {
    presets: ['next/babel'],
    plugins: [
        [
            '@stylexjs/babel-plugin',
            {
                dev: process.env.NODE_ENV === 'development',
                runtimeInjection: false,
                treeshakeCompensation: true,
                aliases: {
                    '@/*': [path.join(__dirname, '*')],
                },
                genConditionalClasses: true,
                unstable_moduleResolution: {
                    type: 'commonJS',
                    rootDir: __dirname,
                },
            },
        ],
    ],
};