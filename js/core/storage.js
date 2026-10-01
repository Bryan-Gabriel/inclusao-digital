/** Camada sobre o localStorage: prefixo, JSON e tolerância a falhas. */
const NS = 'ongad:';
export const storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(NS + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(NS + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) { try { localStorage.removeItem(NS + key); } catch { /* ignora */ } }
};
