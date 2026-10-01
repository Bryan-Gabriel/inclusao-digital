/* Feedback: toasts, modais e alertas dispensáveis (módulo ES). */
const initializedDialogs = new WeakSet();

function trapModalFocus(e) {
  if (e.key !== 'Tab') return;
  const dialog = e.currentTarget;
  const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  if (!controls.length) return;
  const first = controls[0], last = controls[controls.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

  function getContainer() {
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.className = 'toast-container';
      c.setAttribute('role', 'region');
      c.setAttribute('aria-label', 'Notificações');
      document.body.appendChild(c);
    }
    return c;
  }

  function dismiss(el) {
    if (!el || el.classList.contains('is-leaving')) return;
    el.classList.add('is-leaving');
    var remove = function () { if (el.parentNode) el.parentNode.removeChild(el); };
    el.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 400);
  }

  function toast(opts) {
    var type = opts.type || 'info';
    var el = document.createElement('div');
    el.className = 'toast toast--' + type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');

    var content = document.createElement('div');
    content.className = 'toast__content';
    if (opts.title) {
      var t = document.createElement('p');
      t.className = 'toast__title';
      t.textContent = opts.title;
      content.appendChild(t);
    }
    var m = document.createElement('p');
    m.className = 'toast__message';
    m.textContent = opts.message || '';
    content.appendChild(m);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'icon-btn';
    close.setAttribute('aria-label', 'Fechar notificação');
    close.textContent = '×';
    var returnFocus = document.activeElement;
    close.addEventListener('click', function () {
      stop();
      if (el.contains(document.activeElement) && returnFocus?.isConnected) returnFocus.focus();
      dismiss(el);
    });

    el.appendChild(content);
    el.appendChild(close);
    getContainer().appendChild(el);

    // Sem limite de leitura por padrão; durações explícitas pausam sob mouse/foco.
    var duration = opts.duration === undefined ? 0 : opts.duration;
    var timer = null;
    var remaining = duration;
    var startedAt = 0;
    var hovered = false;
    var focused = false;
    function start() {
      if (duration <= 0 || hovered || focused || timer !== null || el.classList.contains('is-leaving')) return;
      startedAt = performance.now();
      timer = setTimeout(function () { timer = null; dismiss(el); }, remaining);
    }
    function stop() {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    }
    el.addEventListener('mouseenter', function () { hovered = true; stop(); });
    el.addEventListener('focusin', function () { focused = true; stop(); });
    el.addEventListener('mouseleave', function () { hovered = false; start(); });
    el.addEventListener('focusout', function (e) {
      focused = el.contains(e.relatedTarget);
      if (!focused) start();
    });
    start();
    return el;
  }

  function openModal(id) {
    var d = document.getElementById(id);
    if (d && typeof d.showModal === 'function' && !d.open) {
      if (!initializedDialogs.has(d)) {
        d.addEventListener('keydown', trapModalFocus);
        initializedDialogs.add(d);
      }
      d.showModal();
    }
  }
  function closeModal(id) {
    var d = document.getElementById(id);
    if (d && d.open) d.close();
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal-open]');
    if (opener) { openModal(opener.getAttribute('data-modal-open')); return; }

    var closer = e.target.closest('[data-modal-close]');
    if (closer) { var dlg = closer.closest('dialog'); if (dlg) dlg.close(); return; }

    var t = e.target.closest('[data-toast]');
    if (t) {
      toast({
        type: t.getAttribute('data-toast'),
        title: t.getAttribute('data-toast-title'),
        message: t.getAttribute('data-toast-message')
      });
      return;
    }

    var a = e.target.closest('[data-alert-close]');
    if (a) {
      var al = a.closest('.alert');
      var heading = al?.closest('section')?.querySelector('h2, h3');
      if (al?.contains(document.activeElement) && heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
      al?.remove();
      return;
    }

    // Fecha apenas no fundo externo; o espaço dentro do diálogo continua interativo.
    if (e.target.tagName === 'DIALOG' && e.target.classList.contains('modal')) {
      var bounds = e.target.getBoundingClientRect();
      if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) e.target.close();
    }
  });

  window.Feedback = { toast, openModal, closeModal }; // compatibilidade com o guia de uso
export { toast, openModal, closeModal };
