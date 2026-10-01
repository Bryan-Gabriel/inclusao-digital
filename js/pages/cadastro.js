/** Controlador do cadastro: validação, máscaras, rascunho e voluntários no localStorage. */
import { $, render, html } from '../core/dom.js';
import { storage } from '../core/storage.js';
import { validateField, mask } from '../core/validators.js';
import { toast, openModal, closeModal } from '../ui/feedback.js';

const KEY_DRAFT = 'rascunho';
const KEY_LIST = 'voluntarios';
const FIELDS = ['name', 'birthdate', 'gender', 'CPF', 'CEP', 'street', 'city', 'state', 'email', 'phone', 'availability'];

export function init(root, { signal }) {
  const form = $('#form-voluntario', root);
  const submit = $('button[type="submit"]', form);
  const hint = $('#submit-hint', root);
  const touched = new Set();
  let draftTimer = null;

  const field = (id) => form.elements[id];
  const values = () => Object.fromEntries(FIELDS.map((id) => [id, field(id).value]));
  const on = (el, type, fn) => el.addEventListener(type, fn, { signal }); // sai junto com a página

  function readVolunteers() {
    const stored = storage.get(KEY_LIST, []);
    // JSON válido também pode conter um tipo inesperado ou registros incompletos.
    return Array.isArray(stored) ? stored.filter((v) => v &&
      ['string', 'number'].includes(typeof v.id) &&
      ['name', 'city', 'state'].every((key) => typeof v[key] === 'string')) : [];
  }

  function saveDraft() {
    draftTimer = null;
    storage.set(KEY_DRAFT, values());
  }

  signal.addEventListener('abort', () => {
    if (draftTimer !== null) {
      clearTimeout(draftTimer);
      saveDraft(); // preserva a última edição antes de o roteador remover o formulário
    }
  }, { once: true });

  // Feedback por campo: aria-invalid + mensagem (cor, ícone e texto)
  function show(id) {
    const el = field(id), msg = $(`#${id}-msg`, form);
    const error = validateField(id, el.value);
    el.setAttribute('aria-invalid', String(Boolean(error)));
    msg.textContent = error || 'Preenchido corretamente';
    msg.className = `field-msg ${error ? 'is-error' : 'is-ok'}`;
    return !error;
  }
  function clearStates() {
    FIELDS.forEach((id) => { field(id).removeAttribute('aria-invalid'); const m = $(`#${id}-msg`, form); m.textContent = ''; m.className = 'field-msg'; });
    touched.clear();
  }
  function refresh() {
    const ok = FIELDS.every((id) => !validateField(id, field(id).value));
    submit.disabled = !ok;
    hint.hidden = ok;
  }

  // Lista de voluntários (templates com escape automático)
  function renderList() {
    const list = readVolunteers();
    render($('#volunteer-list', root), list.length
      ? html`${list.map((v) => html`<li class="volunteer-item"><span><strong>${v.name}</strong> · ${v.city}/${v.state}</span><button type="button" class="button--secondary" data-remove="${v.id}" aria-label="Remover ${v.name}">Remover</button></li>`)}`
      : html`<li class="volunteer-empty">Nenhum voluntário cadastrado ainda.</li>`);
  }

  // Eventos
  on(form, 'input', (e) => {
    const id = e.target.id;
    if (!FIELDS.includes(id)) return;
    if (mask[id]) e.target.value = mask[id](e.target.value);
    if (touched.has(id)) show(id);
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 300);
    refresh();
  });
  on(form, 'change', (e) => { if (FIELDS.includes(e.target.id)) { touched.add(e.target.id); show(e.target.id); refresh(); } });
  on(form, 'focusout', (e) => { if (FIELDS.includes(e.target.id) && e.target.value !== '') { touched.add(e.target.id); show(e.target.id); } });

  on(form, 'submit', (e) => {
    e.preventDefault();
    FIELDS.forEach((id) => touched.add(id));
    const results = FIELDS.map(show);
    const firstInvalid = FIELDS.find((_, i) => !results[i]);
    if (firstInvalid) { field(firstInvalid).focus(); return; }
    openModal('modal-confirmacao');
  });

  on($('#confirmar-envio', root), 'click', () => {
    closeModal('modal-confirmacao');
    clearTimeout(draftTimer);
    draftTimer = null;
    const list = readVolunteers();
    list.push({ id: Date.now(), ...values(), criadoEm: new Date().toISOString() });
    if (!storage.set(KEY_LIST, list)) {
      saveDraft(); // a gravação da lista pode falhar mesmo quando o rascunho ainda pode ser salvo
      toast({ type: 'error', title: 'Cadastro não salvo', message: 'Não foi possível gravar neste navegador. Seus campos foram preservados; tente novamente.' });
      submit.focus();
      return;
    }
    storage.remove(KEY_DRAFT);
    form.reset(); clearStates(); refresh(); renderList();
    field('name').focus(); // o botão de envio fica desabilitado após limpar o formulário
    toast({ type: 'success', title: 'Cadastro enviado!', message: 'Obrigado por se voluntariar. Entraremos em contato em breve.' });
  });

  on($('#volunteer-list', root), 'click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    if (!storage.set(KEY_LIST, readVolunteers().filter((v) => String(v.id) !== btn.dataset.remove))) {
      toast({ type: 'error', title: 'Não foi possível remover', message: 'O cadastro permanece salvo. Verifique o armazenamento do navegador e tente novamente.' });
      return;
    }
    renderList();
    const next = $('[data-remove]', root) ?? $('#lista-titulo', root);
    next.focus();
    toast({ type: 'info', title: 'Removido', message: 'O voluntário foi removido da lista.' });
  });

  // Restaura rascunho salvo
  const draft = storage.get(KEY_DRAFT);
  if (draft && FIELDS.some((id) => draft[id])) {
    FIELDS.forEach((id) => { if (draft[id] !== undefined) field(id).value = draft[id]; });
    toast({ type: 'info', title: 'Rascunho restaurado', message: 'Recuperamos os dados que você havia começado a preencher.' });
  }
  refresh();
  renderList();
}
