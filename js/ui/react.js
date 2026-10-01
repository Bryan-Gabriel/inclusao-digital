/** Integrações progressivas: o HTML funciona antes de carregar os módulos React. */
export async function initReactWidgets(app, { signal }) {
  const accordions = [...app.querySelectorAll('[data-react-accordion]')];
  const progress = app.querySelector('#cadastro-progresso-react');
  if ((!accordions.length && !progress) || signal.aborted) return;

  try {
    const [accordionModule, progressModule] = await Promise.all([
      accordions.length ? import('../components/perguntas.js') : null,
      progress ? import('../components/progresso.js') : null
    ]);
    if (signal.aborted || !app.isConnected) return;
    accordions.forEach((container) => accordionModule.mountQuestions(container, { signal }));
    if (progress) progressModule.mountProgress(progress, app.querySelector('#form-voluntario'), { signal });
  } catch (error) {
    if (!signal.aborted) console.warn('Componentes interativos mantidos em HTML.', error);
  }
}
