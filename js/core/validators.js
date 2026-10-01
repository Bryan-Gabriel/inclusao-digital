/** Regras de validação (funções puras) e máscaras. Retornam '' quando válido. */
const digits = (v) => String(v).replace(/\D/g, '');

export const mask = {
  CPF: (v) => digits(v).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  CEP: (v) => digits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
  phone: (v) => {
    const d = digits(v).slice(0, 11);
    return d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
};

function isCpf(v) {
  const d = digits(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (n) => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === +d[9] && dv(10) === +d[10];
}

function age(iso) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!parts) return null;
  const [year, month, day] = parts.slice(1).map(Number);
  const b = new Date(year, month - 1, day), t = new Date();
  // Verifica o calendário e usa a data local, sem deslocar o aniversário por UTC.
  if (b.getFullYear() !== year || b.getMonth() !== month - 1 || b.getDate() !== day || b > t) return null;
  let a = t.getFullYear() - b.getFullYear();
  if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

const select = (msg) => (v) => (v ? '' : msg);
const text = (min, empty, short) => (v) => (!v.trim() ? empty : v.trim().length < min ? short : '');

export const rules = {
  name: (v) => (!v.trim() ? 'Informe seu nome completo.' : v.trim().split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : ''),
  birthdate: (v) => {
    if (!v) return 'Informe a data de nascimento.';
    const years = age(v);
    return years === null || years > 120 ? 'Data inválida.' : years < 18 ? 'É necessário ter 18 anos ou mais.' : '';
  },
  gender: select('Selecione uma opção.'),
  CPF: (v) => (!v ? 'Informe o CPF.' : isCpf(v) ? '' : 'CPF inválido. Confira os números.'),
  CEP: (v) => (!v ? 'Informe o CEP.' : digits(v).length === 8 ? '' : 'O CEP deve ter 8 dígitos.'),
  street: text(3, 'Informe o endereço.', 'Endereço muito curto.'),
  city: text(2, 'Informe a cidade.', 'Cidade muito curta.'),
  state: select('Selecione o estado.'),
  email: (v) => (!v ? 'Informe o e-mail.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'E-mail inválido. Ex.: nome@dominio.com'),
  phone: (v) => (!v ? 'Informe o telefone.' : [10, 11].includes(digits(v).length) ? '' : 'Telefone inválido. Use DDD + número.'),
  availability: select('Selecione a disponibilidade.')
};

export const validateField = (id, value) => (rules[id] ? rules[id](value) : '');
