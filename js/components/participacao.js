import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';

function PainelParticipacao({ acoes }) {
  const [categoria, setCategoria] = useState('Todas');
  const categorias = ['Todas', ...new Set(acoes.map((acao) => acao.categoria))];
  const visiveis = acoes.filter((acao) => categoria === 'Todas' || acao.categoria === categoria);

  return h('div', { className: 'participacao__conteudo' },
    h('div', { className: 'participacao__filtros', role: 'group', 'aria-label': 'Filtrar formas de participar' },
      categorias.map((opcao) => h('button', {
        key: opcao,
        type: 'button',
        className: 'participacao__filtro',
        'aria-pressed': categoria === opcao,
        'aria-controls': 'participacao-lista',
        onClick: () => setCategoria(opcao)
      }, opcao))
    ),
    h('p', { className: 'participacao__resultado', role: 'status', 'aria-atomic': true },
      `${visiveis.length} ${visiveis.length === 1 ? 'forma de participar' : 'formas de participar'}`
    ),
    h('ul', { id: 'participacao-lista', className: 'participacao__lista' },
      visiveis.map((acao) => h('li', { key: acao.id, className: 'participacao__cartao' },
        h('span', { className: 'participacao__categoria' }, acao.categoria),
        h('h3', null, acao.titulo),
        h('p', null, acao.descricao),
        h('a', { className: 'participacao__link', href: acao.href },
          acao.link, ' ', h('span', { 'aria-hidden': true }, '→')
        )
      ))
    )
  );
}

export function mountParticipacao(container, { signal }) {
  // O HTML é a única fonte dos cartões, inclusive para a versão sem a CDN.
  const acoes = [...container.querySelectorAll('[data-acao]')].map((cartao) => ({
    id: cartao.dataset.acao,
    categoria: cartao.dataset.categoria,
    titulo: cartao.querySelector('h3').textContent,
    descricao: cartao.querySelector('p').textContent,
    href: cartao.querySelector('a').getAttribute('href'),
    link: cartao.querySelector('a').firstChild.textContent.trim()
  }));

  const root = createRoot(container);
  // O roteador aborta a página anterior antes de substituir seu HTML.
  signal.addEventListener('abort', () => root.unmount(), { once: true });
  root.render(h(PainelParticipacao, { acoes }));
}
