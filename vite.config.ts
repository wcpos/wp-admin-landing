import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite inlines CSS into the JS bundle for IIFE builds.
 * WordPress needs separate CSS files (enqueued via wp_enqueue_style).
 * This plugin extracts the inlined CSS back into a separate asset.
 */
function extractCss(): Plugin {
  return {
    name: 'extract-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // Match Vite's CSS injection pattern: document.createElement("style"); ... .textContent=`...`
          const cssMatch = chunk.code.match(
            /var \w+=document\.createElement\("style"\);\w+\.textContent=`([\s\S]*?)`[,;]document\.head\.appendChild/
          );
          if (cssMatch) {
            // Emit the CSS as a separate asset
            this.emitFile({
              type: 'asset',
              fileName: 'css/landing.css',
              source: cssMatch[1],
            });
            // Remove the CSS injection code from the JS
            chunk.code = chunk.code.replace(
              /var \w+=document\.createElement\("style"\);\w+\.textContent=`[\s\S]*?`[,;]document\.head\.appendChild\(\w+\);/,
              ''
            );
          }
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), extractCss()],
  build: {
    outDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.tsx',
      external: ['react', 'react-dom', '@wordpress/element'],
      output: {
        entryFileNames: 'js/landing.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'css/landing.css';
          return 'assets/[name][extname]';
        },
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/element': 'wp.element',
        },
        format: 'iife',
      },
    },
  },
  server: {
    port: 9000,
    cors: true,
  },
});
