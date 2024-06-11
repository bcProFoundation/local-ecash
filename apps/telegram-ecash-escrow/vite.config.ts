import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [tsconfigPaths(), react(), nodePolyfills(), TanStackRouterVite()],
    define: {
      'process.env.REACT_PUBLIC_NETWORK': JSON.stringify(env.REACT_PUBLIC_NETWORK),
      'process.env.REACT_PUBLIC_XPI_APIS': JSON.stringify(env.REACT_PUBLIC_XPI_APIS),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      'process.env.DEPLOY_ENVIROMENT': JSON.stringify(env.DEPLOY_ENVIROMENT),
      'process.env.REACT_PUBLIC_BOT_SERVER_URL': JSON.stringify(env.REACT_PUBLIC_BOT_SERVER_URL)
    },
  };
});
