import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load .env file (Vite auto-loads .env but we also need it in this config)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      react(),
      // Inject VITE_APP_VERSION into HTML <title> at build time
      {
        name: 'inject-version',
        transformIndexHtml(html) {
          const version = env.VITE_APP_VERSION ?? '0.0.0';
          return html.replace(
            '<title>InviteFlow · Convene</title>',
            `<title>InviteFlow · Convene v${version}</title>`
          );
        },
      },
    ],
    // Expose VITE_APP_VERSION to client-side TypeScript as a typed constant
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION ?? '0.0.0'),
    },
    base: env.VITE_BASE_URL ?? './',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          inviteflow: 'src/inviteflow/index.html',
          contactscout: 'src/contactscout/index.html',
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  };
});
