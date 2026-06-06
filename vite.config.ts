import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { readFileSync } from 'fs';

// Read version once from package.json — single source of truth
const pkg = JSON.parse(readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
const APP_VERSION = process.env.APP_VERSION ?? pkg.version ?? '0.0.0';

export default defineConfig(({ mode }) => {
  // Load .env file for other secrets/config
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      react(),
      // Inject version into HTML <title> at build time
      {
        name: 'inject-version',
        transformIndexHtml(html) {
          return html.replace(
            '<title>InviteFlow · Convene</title>',
            `<title>InviteFlow · Convene v${APP_VERSION}</title>`
          );
        },
      },
    ],
    // Expose version to client-side TypeScript + non-prefixed BWS env vars
    define: {
      __APP_VERSION__: JSON.stringify(APP_VERSION),
      'import.meta.env.APP_VERSION': JSON.stringify(APP_VERSION),
      'import.meta.env.RESEND_API_KEY': JSON.stringify(env.RESEND_API_KEY ?? ''),
      'import.meta.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY ?? ''),
      'import.meta.env.OPENAI_ENDPOINT': JSON.stringify(env.OPENAI_ENDPOINT ?? ''),
      'import.meta.env.SERPAPI_KEY': JSON.stringify(env.SERPAPI_KEY ?? ''),
      'import.meta.env.OPENSTATES_API_KEY': JSON.stringify(env.OPENSTATES_API_KEY ?? ''),
    },
    server: {
      allowedHosts: true,
    },
    resolve: {
      alias: {
        '@lenya/webapp-shared': path.resolve(__dirname, 'shared'),
      },
    },
    base: env.BASE_URL ?? '/rsvp/',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          inviteflow: 'src/inviteflow/index.html',
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
