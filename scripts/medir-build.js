import { mkdtemp, readdir, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import config, { minifyHtml } from '../vite.config.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporaryRoot = resolve(tmpdir());
const baseline = await mkdtemp(join(temporaryRoot, 'inclusao-medicao-'));

async function sizes(directory, result = { html: 0, css: 0, js: 0 }) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await sizes(path, result);
    else {
      const type = extname(entry.name).slice(1);
      if (Object.hasOwn(result, type)) result[type] += (await stat(path)).size;
    }
  }
  return result;
}

try {
  // Mesmo grafo de produção e mesmas dependências; altera somente a minificação.
  await build({
    ...config, root, configFile: false, logLevel: 'silent',
    plugins: [minifyHtml(false)],
    build: { ...config.build, outDir: baseline, emptyOutDir: false, minify: false, cssMinify: false }
  });
  await build({ ...config, root, configFile: false, logLevel: 'silent' });
  const before = await sizes(baseline);
  const after = await sizes(join(root, config.build.outDir));
  const result = Object.keys(before).map(type => ({
    tipo: type.toUpperCase(),
    antesBytes: before[type],
    depoisBytes: after[type],
    reducaoPercentual: Number(((1 - after[type] / before[type]) * 100).toFixed(2))
  }));
  const totalBefore = Object.values(before).reduce((sum, n) => sum + n, 0);
  const totalAfter = Object.values(after).reduce((sum, n) => sum + n, 0);
  result.push({ tipo: 'TOTAL', antesBytes: totalBefore, depoisBytes: totalAfter,
    reducaoPercentual: Number(((1 - totalAfter / totalBefore) * 100).toFixed(2)) });
  console.log(JSON.stringify(result, null, 2));
} finally {
  // Remove apenas o diretório temporário criado nesta execução.
  if (dirname(baseline) === temporaryRoot && basename(baseline).startsWith('inclusao-medicao-')) {
    await rm(baseline, { recursive: true, force: true });
  }
}
