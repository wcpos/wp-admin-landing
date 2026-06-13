import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

type Target = 'bootstrap' | 'indie' | 'free-plus';
const target = (process.env.BUILD_TARGET ?? 'bootstrap') as Target;

const TARGETS: Record<Target, { entry: string; js: string; css: string }> = {
  bootstrap: { entry: 'src/bootstrap/index.tsx', js: 'js/welcome.js', css: 'css/welcome.css' },
  indie: { entry: 'src/variants/indie/index.tsx', js: 'js/variants/indie.js', css: 'css/variants/indie.css' },
  'free-plus': { entry: 'src/variants/free-plus/index.tsx', js: 'js/variants/free-plus.js', css: 'css/variants/free-plus.css' },
};
const t = TARGETS[target];

/** Re-extracts Vite's inlined CSS into a separate file (WordPress enqueues CSS
 *  separately). Parameterised per target — the old version hardcoded welcome.css. */
function extractCss(cssFileName: string): Plugin {
  return {
    name: 'extract-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      let cssExtracted = false;
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          const cssMatch = chunk.code.match(
            /var \w+=document\.createElement\("style"\);\w+\.textContent=`([\s\S]*?)`[,;]document\.head\.appendChild/
          );
          if (cssMatch) {
            cssExtracted = true;
            const css = cssMatch[1].replace(/\\(.)/g, '$1');
            this.emitFile({ type: 'asset', fileName: cssFileName, source: css });
            chunk.code = chunk.code.replace(
              /var \w+=document\.createElement\("style"\);\w+\.textContent=`[\s\S]*?`[,;]document\.head\.appendChild\(\w+\);/,
              ''
            );
          }
        }
      }
      if (!cssExtracted) this.warn(`extract-css(${cssFileName}): no inline CSS found.`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), extractCss(t.css)],
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: t.entry,
      // Variants must NOT bundle posthog/i18next — they use window.wcpos.landingRuntime.
      // React stays external everywhere (wp.element). react-i18next IS bundled per
      // variant (it binds to the runtime's i18next instance via I18nextProvider).
      external: ['react', 'react-dom', '@wordpress/element'],
      output: {
        entryFileNames: t.js,
        assetFileNames: (info) => (info.name?.endsWith('.css') ? t.css : 'assets/[name][extname]'),
        globals: { react: 'React', 'react-dom': 'ReactDOM', '@wordpress/element': 'wp.element' },
        format: 'iife',
      },
    },
  },
  server: { port: 9000, cors: true },
});
