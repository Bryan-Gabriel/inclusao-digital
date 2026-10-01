/** Menu hambúrguer (mobile) e fechamento automático ao trocar de rota. */
export function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu-principal');
  if (!toggle || !menu) return;

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  document.addEventListener('route:change', () => setMenu(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
}
