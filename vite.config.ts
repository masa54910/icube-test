import { defineConfig, type Plugin } from 'vite';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

function playablesRelativePaths(): Plugin {
  return {
    name: 'playables-relative-paths',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === 'asset' && output.fileName === 'manifest.webmanifest') {
          const manifest = String(output.source)
            .replace(/"\/icons\//g, '"./icons/')
            .replace(/"start_url"\s*:\s*"\/"/g, '"start_url":"./"')
            .replace(/"scope"\s*:\s*"\/"/g, '"scope":"./"');
          output.source = manifest;
        }
        if (output.type === 'chunk') {
          // Only rewrite local asset literals emitted from the game bundle.
          // API endpoints and external HTTPS URLs are intentionally untouched.
          output.code = output.code
            .replace(/(["'])\/assets\//g, '$1./assets/')
            .replace(/(["'])\/icons\//g, '$1./icons/')
            .replace(/(["'])\/manifest\.webmanifest/g, '$1./manifest.webmanifest');
        }
        if (output.type === 'asset' && output.fileName.endsWith('.html')) {
          output.source = String(output.source)
            .replace(/(href|src)="\/(assets|icons|manifest\.webmanifest)/g, '$1="./$2');
        }
      }
    },
    writeBundle(options) {
      const outDir = options.dir;
      if (!outDir) return;
      const manifestPath = join(outDir, 'manifest.webmanifest');
      try {
        const manifest = readFileSync(manifestPath, 'utf8')
          .replace(/"\/icons\//g, '"./icons/')
          .replace(/"start_url"\s*:\s*"\/"/g, '"start_url":"./"')
          .replace(/"scope"\s*:\s*"\/"/g, '"scope":"./"');
        writeFileSync(manifestPath, manifest);
      } catch {
        // A custom output configuration may omit the optional manifest.
      }
    },
  };
}

function crazyGamesBundle(): Plugin {
  return {
    name: 'crazygames-basic-bundle',
    transformIndexHtml(html) {
      return html.replace(/\s*<script src="https:\/\/www\.youtube\.com\/game_api\/v1"><\/script>/, '');
    },
    writeBundle(options) {
      // The public/ tree contains the Web-only admin dashboard. It must never
      // be shipped in the standalone CrazyGames upload.
      if (options.dir) rmSync(join(options.dir, 'admin'), { recursive: true, force: true });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'playables' ? [playablesRelativePaths()] : mode === 'crazygames' ? [playablesRelativePaths(), crazyGamesBundle()] : [],
  build: {
    target: 'es2020',
    assetsInlineLimit: 8192,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/game-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: {
    environment: 'node',
  },
}));
