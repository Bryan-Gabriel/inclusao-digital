/** Utilitários de DOM e mini sistema de templates com escape automático (anti-XSS). */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

class SafeHtml { constructor(v) { this.value = v; } toString() { return this.value; } }
export const raw = (s) => new SafeHtml(String(s));

export function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const toStr = (v) => {
  if (v instanceof SafeHtml) return v.value;
  if (Array.isArray(v)) return v.map(toStr).join('');
  return v === null || v === undefined || v === false ? '' : escapeHtml(v);
};

/** Tagged template: html`<li>${nome}</li>` escapa tudo que for interpolado. */
export function html(strings, ...values) {
  return raw(strings.reduce((out, s, i) => out + s + (i < values.length ? toStr(values[i]) : ''), ''));
}

/** Única porta de entrada de HTML no DOM. */
export function render(target, markup) { target.innerHTML = String(markup); }
