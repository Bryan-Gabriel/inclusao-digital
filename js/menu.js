document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu-principal');

  // Se a página não tem o menu, encerra sem gerar erro
  if (!toggle || !menu) return;

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setMenu(!menu.classList.contains('is-open'));
  });

  // Esc fecha o menu e devolve o foco ao botão
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Ao voltar para desktop, reseta o estado do menu mobile
  window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });
});