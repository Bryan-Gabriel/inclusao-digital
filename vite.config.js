import { readdir, readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import { minify } from 'html-minifier-terser';

const htmlOptions = {
  collapseWhitespace: true,
  conservativeCollapse: true, // preserva a separação entre textos de elementos inline
  removeComments: true
};

/** Os fragmentos buscados por fetch não fazem parte do grafo de imports do Vite. */
export function minifyHtml(enabled = true) {
  return {
    name: 'minificar-html-da-spa',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) => enabled ? minify(html, htmlOptions) : html
    },
    async generateBundle() {
      const directory = new URL('./html/', import.meta.url);
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
        const source = await readFile(new URL(entry.name, directory), 'utf8');
        this.emitFile({
          type: 'asset',
          fileName: `html/${entry.name}`,
          source: enabled ? await minify(source, htmlOptions) : source
        });
      }
    }
  };
}

export default defineConfig({
  base: './', // funciona na raiz e no subdiretório do GitHub Pages
  plugins: [minifyHtml()],
  build: {
    outDir: 'dist',
    minify: 'oxc',
    cssMinify: 'lightningcss',
    sourcemap: false
  }
});
