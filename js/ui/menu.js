/** Menu hambúrguer (mobile) e fechamento automático ao trocar de rota. */
export function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu-principal');
  if (!toggle || !menu) return;
  const submenuToggle = menu.querySelector('.submenu-toggle');
  const submenu = document.getElementById(submenuToggle?.getAttribute('aria-controls'));

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  const setSubmenu = (open) => {
    if (!submenu || !submenuToggle) return;
    submenu.hidden = !open;
    submenuToggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    setMenu(open);
    if (!open) setSubmenu(false);
  });
  submenuToggle?.addEventListener('click', () => setSubmenu(submenu.hidden));
  submenuToggle?.parentElement.addEventListener('focusout', (e) => {
    if (!submenuToggle.parentElement.contains(e.relatedTarget)) setSubmenu(false);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-submenu')) setSubmenu(false);
  });
  document.addEventListener('route:change', () => { setMenu(false); setSubmenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (submenu && !submenu.hidden) { setSubmenu(false); submenuToggle.focus(); }
    else if (menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    setSubmenu(false);
    if (e.matches) setMenu(false);
  });
}
