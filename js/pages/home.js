/** Acrescenta o painel React depois de carregar a página inicial em JavaScript puro. */
export async function init(app, { signal }) {
  const container = app.querySelector('#participacao-react');
  if (!container || signal.aborted) return;

  try {
    const { mountParticipacao } = await import('../components/participacao.js');
    // A pessoa pode ter mudado de rota enquanto o módulo carregava.
    if (signal.aborted || !container.isConnected) return;
    mountParticipacao(container, { signal });
  } catch (error) {
    // O HTML original continua visível e seus links permanecem utilizáveis.
    if (!signal.aborted) console.warn('Painel interativo indisponível; mantendo os cartões em HTML.', error);
  }
}
