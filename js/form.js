document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('form');
  if (!form) return;

  var btn = form.querySelector('button[type="submit"]');
  var hint = document.getElementById('submit-hint');
  if (!btn) return;

  // Habilita o envio só quando todos os campos obrigatórios estão válidos
  function update() {
    var ok = form.checkValidity();
    btn.disabled = !ok;
    if (hint) hint.hidden = ok;
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();

  // Envio: abre o modal de confirmação (em vez de recarregar a página)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.checkValidity() && window.Feedback) Feedback.openModal('modal-confirmacao');
  });

  // Confirmação: fecha o modal, mostra toast de sucesso e limpa o formulário
  var confirmBtn = document.getElementById('confirmar-envio');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      Feedback.closeModal('modal-confirmacao');
      Feedback.toast({
        type: 'success',
        title: 'Cadastro enviado!',
        message: 'Obrigado por se voluntariar. Entraremos em contato em breve.'
      });
      form.reset();
      update();
    });
  }
});
