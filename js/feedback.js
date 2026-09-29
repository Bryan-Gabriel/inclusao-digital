/* Feedback: toasts, modais (<dialog>) e alertas dispensáveis. */
(function () {
  function getContainer() {
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.className = 'toast-container';
      c.setAttribute('aria-live', 'polite');
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
    close.addEventListener('click', function () { dismiss(el); });

    el.appendChild(content);
    el.appendChild(close);
    getContainer().appendChild(el);

    // Fecha sozinho; pausa enquanto o mouse/foco estiver sobre o toast
    var duration = opts.duration === undefined ? 5000 : opts.duration;
    var timer;
    function start() { if (duration > 0) timer = setTimeout(function () { dismiss(el); }, duration); }
    function stop() { clearTimeout(timer); }
    el.addEventListener('mouseenter', stop);
    el.addEventListener('focusin', stop);
    el.addEventListener('mouseleave', start);
    el.addEventListener('focusout', start);
    start();
    return el;
  }

  function openModal(id) {
    var d = document.getElementById(id);
    if (d && typeof d.showModal === 'function' && !d.open) d.showModal();
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
    if (a) { var al = a.closest('.alert'); if (al) al.remove(); return; }

    // Clique no fundo escurecido fecha o modal
    if (e.target.tagName === 'DIALOG' && e.target.classList.contains('modal')) e.target.close();
  });

  window.Feedback = { toast: toast, openModal: openModal, closeModal: closeModal };
})();
