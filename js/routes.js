/** Tabela de rotas: cada rota aponta para um fragmento em html/ e, se precisar, um controlador carregado sob demanda. */
export const routes = {
  '/': { title: 'Início', heading: 'ONG Acesso Digital', template: 'home' },
  '/projeto': { title: 'Projeto', heading: 'Frentes de Atuação', template: 'projeto' },
  '/contato': { title: 'Contato', heading: 'Contate-nos', template: 'contato' },
  '/componentes': { title: 'Componentes', heading: 'Componentes de Feedback', template: 'componentes' },
  '/cadastro': { title: 'Cadastro', heading: 'Cadastro de Voluntários', template: 'cadastro', controller: () => import('./pages/cadastro.js') },
  '*': { title: 'Página não encontrada', heading: 'Página não encontrada', template: 'nao-encontrado' }
};
