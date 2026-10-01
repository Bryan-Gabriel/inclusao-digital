import { storage } from '../core/storage.js';

/** A escolha manual prevalece sobre a preferência de contraste do sistema. */
export function initContrast() {
  const button = document.querySelector('#contrast-toggle');
  const system = window.matchMedia('(prefers-contrast: more)');
  const saved = storage.get('contrast');
  let preference = typeof saved === 'boolean' ? saved : null;

  const apply = () => {
    const enabled = preference ?? system.matches;
    document.documentElement.dataset.contrast = enabled ? 'high' : 'normal';
    button?.setAttribute('aria-pressed', String(enabled));
    const state = button?.querySelector('.contrast-toggle__state');
    if (state) state.textContent = enabled ? 'Ativado' : 'Desativado';
  };

  button?.addEventListener('click', () => {
    preference = document.documentElement.dataset.contrast !== 'high';
    storage.set('contrast', preference);
    apply();
  });
  system.addEventListener('change', apply);
  apply();
}
