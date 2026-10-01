/** Roteador SPA baseado em hash (#/rota/âncora): funciona no GitHub Pages sem configuração de servidor. */
import { $, $$, render } from './dom.js';
import { loadTemplate } from './templates.js';
import { initReactWidgets } from '../ui/react.js';

const ERRO = '<div class="alert alert--error" role="alert"><div class="alert__content"><p class="alert__title">Não foi possível carregar a página</p><p class="alert__text">Verifique sua conexão e tente novamente.</p><button type="button" data-route-retry>Tentar novamente</button></div></div>';

let routes = {};
let controller = null;   // AbortController dos listeners da página atual
let token = 0;           // descarta renderizações obsoletas (cliques rápidos)
let first = true;
let routeFailed = false;
let reloadRequired = false;

function parse(hash) {
  const [name = '', anchor = ''] = hash.replace(/^#\/?/, '').split('/');
  return { path: '/' + name, anchor };
}

export function navigate(hash) {
  history.pushState(null, '', hash);
  renderRoute();
}

async function renderRoute() {
  const { path, anchor } = parse(location.hash);
  const route = routes[path] ?? routes['*'];
  const mine = ++token;
  controller?.abort();                       // remove os listeners da página anterior
  controller = new AbortController();

  let markup = ERRO, page = {}, failed = false, controllerFailed = false;
  try {
    // template (fetch em html/) e controlador (import dinâmico) carregam em paralelo
    const controllerRequest = route.controller?.().catch((error) => {
      controllerFailed = true;
      // O HTML pode ter falhado antes de esta importação terminar.
      if (mine === token) reloadRequired = true;
      throw error;
    });
    const [tpl, mod] = await Promise.all([loadTemplate(route.template, { rota: location.hash }), controllerRequest]);
    markup = tpl; page = mod ?? {};
  } catch (error) {
    failed = true;
    console.error(`Falha ao carregar a rota ${path}:`, error);
  }
  if (mine !== token) return;
  routeFailed = failed;
  reloadRequired = controllerFailed;

  const app = $('#app');
  app.dataset.page = route.template;         // permite estilizar por página (ex.: #app[data-page="projeto"])
  render(app, markup);                       // injeção do conteúdo na div principal
  $('#page-title').textContent = route.heading;
  document.title = `${route.title} | ONG Acesso Digital`;
  $$('#menu-principal a').forEach((a) => a.removeAttribute('aria-current'));
  const link = $(`#menu-principal > li > a[href="#${path === '/' ? '/' : path}"]`);
  if (link) link.setAttribute('aria-current', 'page');
  page.init?.(app, { signal: controller.signal });
  initReactWidgets(app, { signal: controller.signal });

  if (anchor && document.getElementById(anchor)) {
    document.getElementById(anchor).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  } else {
    window.scrollTo(0, 0);
    if (!first) $('#page-title').focus();     // acessibilidade: move o foco para o novo título
  }
  $('#route-announcer').textContent = failed ? `Não foi possível carregar ${route.title}` : `${route.title} carregada`;
  first = false;
  document.dispatchEvent(new CustomEvent('route:change', { detail: { path } }));
}

function onClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (e.target.closest('[data-route-retry]')) {
    // Imports rejeitados ficam no cache de módulos do navegador; recarregar permite buscá-los de novo.
    if (reloadRequired) location.reload();
    else renderRoute();
    return;
  }
  const a = e.target.closest('a[href^="#/"]');
  if (!a) return;
  e.preventDefault();                        // intercepta: impede o comportamento padrão do link
  if (a.getAttribute('href') !== location.hash) navigate(a.getAttribute('href'));
  else if (routeFailed) {
    if (reloadRequired) location.reload();
    else renderRoute();
  }
}

export function startRouter(table) {
  routes = table;
  document.addEventListener('click', onClick);
  window.addEventListener('popstate', () => {           // botões voltar/avançar e edição manual da URL
    if (location.hash === '' || location.hash.startsWith('#/')) renderRoute();
  });
  renderRoute();
}
