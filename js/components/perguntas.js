import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';

function Questions({ items, prefix }) {
  const [open, setOpen] = useState(null);
  return h('div', { className: 'questions' }, items.map((item, index) => {
    const expanded = open === index;
    const answerId = `${prefix}-resposta-${index}`;
    const buttonId = `${prefix}-pergunta-${index}`;
    return h('div', { className: 'questions__item', key: answerId },
      h('h3', { className: 'questions__heading' }, h('button', {
        id: buttonId,
        type: 'button',
        className: 'questions__button',
        'aria-expanded': expanded,
        'aria-controls': answerId,
        onClick: () => setOpen(expanded ? null : index)
      }, item.question, h('span', { 'aria-hidden': true }, expanded ? '−' : '+'))),
      h('div', { id: answerId, hidden: !expanded, className: 'questions__answer', 'aria-labelledby': buttonId },
        h('p', null, item.answer)
      )
    );
  }));
}

export function mountQuestions(container, { signal }) {
  const items = [...container.querySelectorAll('details')].map((item) => ({
    question: item.querySelector('summary').textContent,
    answer: item.querySelector('p').textContent
  }));
  const root = createRoot(container);
  signal.addEventListener('abort', () => root.unmount(), { once: true });
  root.render(h(Questions, { items, prefix: container.id }));
}
