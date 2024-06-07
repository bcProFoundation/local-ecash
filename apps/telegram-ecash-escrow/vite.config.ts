import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), nodePolyfills(), TanStackRouterVite()],
    define: {
      'process.env.REACT_PUBLIC_NETWORK': JSON.stringify(env.REACT_PUBLIC_NETWORK),
      'process.env.REACT_PUBLIC_XPI_APIS': JSON.stringify(env.REACT_PUBLIC_XPI_APIS),
      'process.env.REACT_PUBLIC_BWS_URL': JSON.stringify(env.REACT_PUBLIC_BWS_URL),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      'process.env.DEPLOY_ENVIROMENT': JSON.stringify(env.DEPLOY_ENVIROMENT),
      'process.env.REACT_PUBLIC_BOT_SERVER_URL': JSON.stringify(env.REACT_PUBLIC_BOT_SERVER_URL)
    },
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: '@local-store', replacement: path.resolve(__dirname, 'src/store') },
        { find: '@api', replacement: path.resolve(__dirname, 'src/api') },
        { find: '@models', replacement: path.resolve(__dirname, 'src/models') },
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
        { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
        { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
        { find: '@context', replacement: path.resolve(__dirname, 'src/context') }
      ]
    }
  };
});
