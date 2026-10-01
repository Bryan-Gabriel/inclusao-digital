/** Sistema de templates: busca fragmentos em html/, guarda em cache e interpola {{chave}} com escape. */
import { escapeHtml } from './dom.js';

const cache = new Map();   // nome -> Promise<string> (evita requisições repetidas)

function fetchTemplate(name) {
  if (!cache.has(name)) {
    const req = fetch(`html/${name}.html`, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Template "${name}" não encontrado (${res.status})`);
      return res.text();
    });
    req.catch(() => cache.delete(name));   // permite nova tentativa depois de uma falha
    cache.set(name, req);
  }
  return cache.get(name);
}

/** Retorna o HTML do template com {{chave}} substituído por data[chave] (sempre escapado). */
export async function loadTemplate(name, data = {}) {
  const source = await fetchTemplate(name);
  return source.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => escapeHtml(data[key] ?? ''));
}

/** Pré-carrega templates em segundo plano para deixar a navegação instantânea. */
export function prefetch(names) {
  const run = () => names.forEach((n) => fetchTemplate(n).catch(() => {}));
  'requestIdleCallback' in window ? requestIdleCallback(run) : setTimeout(run, 500);
}
