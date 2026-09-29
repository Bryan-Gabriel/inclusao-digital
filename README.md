# ONG Acesso Digital

Projeto acadêmico desenvolvido para aplicar, na prática, HTML5 semântico, boas práticas de acessibilidade digital e uma camada de interface responsiva e interativa (menu, botões, formulários e componentes de feedback) na construção de páginas web para o terceiro setor.

## Acesso ao site

https://bryan-gabriel.github.io/inclusao-digital/

## Sobre o projeto

O site simula a página institucional de uma ONG fictícia chamada Acesso Digital, cuja missão é conscientizar desenvolvedores, empresas e instituições sobre a importância da acessibilidade na web.

## Funcionalidades

### Navegação responsiva

- Menu horizontal com **dropdown** (submenu de "Projeto") em telas a partir de 768px.
- Menu **hambúrguer** em telas menores, com ícone desenhado apenas com CSS que se transforma em "X" ao abrir.
- Abordagem mobile-first: o CSS base descreve o menu condensado e a media query `@media (min-width: 768px)` o expande.
- Submenu oculto por padrão (`opacity`, `visibility` e `transform`) e revelado por `:hover` e `:focus-within`, garantindo acesso também por teclado.
- `aria-expanded` e `aria-controls` no botão, tecla `Esc` fecha o menu e `aria-current` destaca a página atual.

### Botões com estados interativos

Estados visuais distintos para `:hover` (fundo mais escuro, sombra e elevação), `:focus-visible` (contorno amarelo espesso e halo), `:active` (afundamento com sombra interna) e `:disabled` (aparência apagada e cursor bloqueado), com transições suaves.

### Formulário com validação visual

- Campos com altura mínima de 44px, borda destacada em `:hover` e `:focus`.
- Validação com `:user-valid` e `:user-invalid`, exibida somente após a interação do usuário.
- Sinalização por **cor, ícone e texto** (borda vermelha com "✕" ou borda verde com "✓"), sem depender apenas da cor.
- Asterisco automático nos campos obrigatórios.
- O botão de envio permanece desabilitado até o formulário ser válido, com texto de apoio explicando o motivo.
- Ao enviar, abre um **modal de confirmação**. Após confirmar, aparece um **toast de sucesso** e o formulário é limpo.

### Componentes de feedback

Biblioteca de estilos padronizada com a paleta do projeto, documentada e demonstrada em `componentes.html`:

| Componente | Descrição | Variantes |
|---|---|---|
| Badge | Etiqueta para categorizar status | `success`, `info`, `warning`, `error`, `neutral` |
| Alerta | Caixa de mensagem contextual, com botão de fechar opcional | `success`, `info`, `warning`, `error` |
| Toast | Notificação não obstrutiva, some em 5s e pausa ao passar o mouse ou focar | `success`, `info`, `warning`, `error` |
| Modal | Janela de diálogo baseada no elemento nativo `<dialog>` | `success`, `info`, `warning`, `error` |

## Estrutura do projeto

```
.
├── index.html          # Página inicial, com o menu responsivo
├── projeto.html        # Atuação da ONG: objetivos, voluntariado, doações e parcerias
├── cadastro.html       # Formulário de voluntários com validação e modal de confirmação
├── contact.html        # Informações de contato
├── componentes.html    # Catálogo dos componentes de feedback
├── css/
│   ├── styles.css      # Design tokens, layout, menu, botões e formulários
│   └── feedback.css    # Badges, alertas, toasts e modais
├── js/
│   ├── menu.js         # Abre/fecha o menu hambúrguer
│   ├── form.js         # Habilita o envio, abre o modal e dispara o toast
│   └── feedback.js     # API de toasts, modais e alertas dispensáveis
└── assets/
    └── images.jpg
```

## Guia rápido dos componentes (para novos desenvolvedores)

Regra geral: `componente componente--variante`. Alertas e toasts de erro usam `role="alert"`; os demais, `role="status"`.

```html
<!-- Badge -->
<span class="badge badge--success">Ativo</span>

<!-- Alerta -->
<div class="alert alert--error" role="alert">
  <div class="alert__content">
    <p class="alert__title">Não foi possível enviar</p>
    <p class="alert__text">Verifique os campos destacados.</p>
  </div>
</div>
```

```js
// Toast (carregar js/feedback.js)
Feedback.toast({ type: 'success', title: 'Salvo!', message: 'Seus dados foram atualizados.' });

// Modal (elemento <dialog class="modal modal--info" id="meu-modal">)
Feedback.openModal('meu-modal');
Feedback.closeModal('meu-modal');
```

No HTML, também é possível usar atributos: `data-modal-open="id"`, `data-modal-close`, `data-toast="success"` (com `data-toast-title` e `data-toast-message`) e `data-alert-close`.

## Design tokens

Definidos como variáveis CSS em `:root` (`css/styles.css`).

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#0b5fff` | Cabeçalho, links, foco de campos |
| `--color-primary-dark` | `#0847bf` | Menu, hover de links |
| `--color-secondary` | `#00a676` | Botões e sucesso |
| `--color-secondary-dark` | `#00805b` | Hover de botões e campo válido |
| `--color-accent` | `#f2a900` | Contorno de foco e avisos |
| `--color-error` | `#c62828` | Erros e campos inválidos |

Também há escalas de neutros, espaçamento (`--space-1` a `--space-7`), tipografia e raio de borda.

## Responsividade

Grid de 12 colunas com breakpoints mobile-first em 576px, 768px, 992px, 1200px e 1400px. O menu alterna entre hambúrguer e dropdown em 768px.

## Práticas de HTML5 semântico e acessibilidade aplicadas

Elementos semânticos: uso de header, nav, main, section, article, footer e dialog no lugar de divs genéricas, refletindo a estrutura real do conteúdo.

Atributos ARIA: aria-label em elementos de navegação, aria-labelledby associando seções, artigos e modais aos seus títulos, aria-describedby nos modais, aria-expanded e aria-controls no menu, e aria-current na página atual.

Hierarquia de cabeçalhos: uso consistente de h1 a h3 respeitando a ordem lógica do conteúdo.

Formulários acessíveis (cadastro.html):
- Todo campo possui label associado ao seu id via atributo for.
- Uso de autocomplete (name, bday, email, tel, postal-code) para facilitar o preenchimento.
- Uso de inputmode e pattern para orientar o tipo de teclado e validar formatos (CPF, CEP, telefone).
- Agrupamento de campos relacionados com fieldset e legend.
- Validação visual com cor, ícone e texto, sem depender apenas da cor.

Interação e movimento:
- Estados de foco visíveis (`:focus-visible`) em links, botões e campos.
- Menu e submenu acessíveis por teclado (`:focus-within`, `Esc`).
- Modais nativos com foco preso, fechamento por `Esc` e retorno do foco ao elemento de origem.
- Toasts com pausa ao passar o mouse ou focar.
- `prefers-reduced-motion` desativa transições e animações.
- Alvos de toque com no mínimo 44px de altura.

Texto alternativo em imagens: atributo alt descritivo na imagem da página inicial.

Links descritivos: textos informativos em vez de "clique aqui", com rel="noopener noreferrer" em links externos que abrem em nova aba.

Navegação consistente: todas as páginas internas possuem um link de retorno para a página inicial.

## Autor

Bryan Gabriel
- GitHub: github.com/Bryan-Gabriel
- LinkedIn: linkedin.com/in/bryan-gabriel

## Tecnologias utilizadas

HTML5 semântico, CSS3 (variáveis, Grid, Flexbox, media queries, transições e animações), JavaScript puro (sem bibliotecas) e boas práticas de acessibilidade web (WCAG).
