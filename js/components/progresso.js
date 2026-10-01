import { createElement as h, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { validateField } from '../core/validators.js';

function readProgress(form) {
  return [...form.querySelectorAll('fieldset')].map((group) => {
    const fields = [...group.querySelectorAll('[required]')];
    return {
      label: group.querySelector('legend').textContent,
      total: fields.length,
      complete: fields.filter((field) => !validateField(field.id, field.value)).length
    };
  });
}

function RegistrationProgress({ form }) {
  const [groups, setGroups] = useState(() => readProgress(form));
  useEffect(() => {
    const events = new AbortController();
    const update = () => { if (!events.signal.aborted) setGroups(readProgress(form)); };
    ['input', 'change'].forEach((type) => form.addEventListener(type, update, { signal: events.signal }));
    form.addEventListener('reset', () => queueMicrotask(update), { signal: events.signal });
    update();
    return () => events.abort();
  }, [form]);

  const complete = groups.reduce((sum, group) => sum + group.complete, 0);
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  return h('div', { className: 'registration-progress__content' },
    h('div', { className: 'registration-progress__title' },
      h('strong', null, 'Seu cadastro, passo a passo'),
      h('span', null, `${complete} de ${total} campos concluídos`)
    ),
    h('progress', { value: complete, max: total, 'aria-label': 'Progresso do cadastro' }),
    h('ol', { className: 'registration-progress__steps' }, groups.map((group, index) => {
      const done = group.complete === group.total;
      return h('li', { key: group.label, className: done ? 'is-complete' : undefined },
        h('span', { className: 'registration-progress__number', 'aria-hidden': true }, done ? '✓' : index + 1),
        group.label,
        done && h('span', { className: 'sr-only' }, ' — concluído')
      );
    }))
  );
}

export function mountProgress(container, form, { signal }) {
  const root = createRoot(container);
  signal.addEventListener('abort', () => root.unmount(), { once: true });
  root.render(h(RegistrationProgress, { form }));
}
