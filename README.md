# ONG Acesso Digital

Projeto acadêmico desenvolvido para aplicar, na prática, HTML5 semântico, boas práticas de acessibilidade digital e uma camada de interface responsiva e interativa (menu, botões, formulários e componentes de feedback) na construção de páginas web para o terceiro setor.

## Acesso ao site

https://bryan-gabriel.github.io/inclusao-digital/

## Sobre o projeto

O site simula a página institucional de uma ONG fictícia chamada Acesso Digital, cuja missão é conscientizar desenvolvedores, empresas e instituições sobre a importância da acessibilidade na web.

## Funcionalidades

### Painel de participação com React

- Cartões na página inicial para voluntariado, capacitação e doações, com filtros por categoria.
- React e React DOM **19.2.4**, importados como módulos ES pela CDN esm.sh, com versões fixadas em um `importmap`.
- Estado do filtro controlado por `useState`, botões com `aria-pressed` e contagem de resultados anunciada por `role="status"`.
- Carregamento sob demanda; os cartões em HTML continuam acessíveis se a CDN falhar.
- Ao sair da página inicial, o roteador dispara o `AbortController` e o componente é desmontado com `root.unmount()`.
- Perguntas expansíveis em Projeto e Contato e progresso do cadastro também usam componentes React.


### Navegação responsiva

- Menu horizontal com **dropdown** (submenu de "Projeto") em telas a partir de 768px.
- Menu **hambúrguer** em telas menores, com ícone desenhado apenas com CSS que se transforma em "X" ao abrir.
- Abordagem mobile-first: o CSS base descreve o menu condensado e a media query `@media (min-width: 768px)` o expande.
- Submenu controlado por um botão nativo, com `aria-expanded`, `aria-controls` e `hidden`; Enter ou Espaço alternam sua abertura e `Esc` devolve o foco ao botão.
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

Componentes próprios com a paleta do projeto, documentados e demonstrados em `#/componentes`:

| Componente | Descrição | Variantes |
|---|---|---|
| Badge | Etiqueta para categorizar status | `success`, `info`, `warning`, `error`, `neutral` |
| Alerta | Caixa de mensagem contextual, com botão de fechar opcional | `success`, `info`, `warning`, `error` |
| Toast | Permanece até ser fechado; durações explícitas pausam ao passar o mouse ou focar | `success`, `info`, `warning`, `error` |
| Modal | Janela de diálogo baseada no elemento nativo `<dialog>` | `success`, `info`, `warning`, `error` |

## Estrutura do projeto

```
.
├── index.html          # Estrutura da SPA, menu e importmap do React
├── html/               # Fragmentos HTML carregados pelo roteador
│   ├── home.html        # Página inicial e cartões usados pelo React
│   ├── projeto.html     # Atuação da ONG
│   ├── cadastro.html    # Cadastro e lista local de voluntários
│   ├── contato.html     # Informações de contato
│   ├── componentes.html # Catálogo dos componentes próprios de feedback
│   └── nao-encontrado.html
├── css/
│   ├── styles.css      # Design tokens, layout, menu, botões e formulários
│   ├── feedback.css    # Badges, alertas, toasts e modais
│   ├── spa.css         # Acessibilidade das rotas e validação
│   ├── participacao.css # Aparência do painel de cartões
│   └── interface.css   # Aparência das telas, perguntas e progresso
├── js/
│   ├── main.js         # Inicializa menu e roteador em JavaScript puro
│   ├── routes.js       # Define páginas e controladores sob demanda
│   ├── core/           # Roteador, templates, DOM, armazenamento e validação
│   ├── ui/             # Menu e feedback em JavaScript puro
│   ├── pages/
│   │   ├── home.js      # Carrega o componente React com tratamento de falhas
│   │   └── cadastro.js  # Controlador do formulário
│   └── components/
│       ├── participacao.js # Cartões e filtros
│       ├── perguntas.js # Perguntas expansíveis
│       └── progresso.js # Progresso do cadastro
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
import { toast, openModal, closeModal } from './js/ui/feedback.js';

// Dentro de um script type="module".
toast({ type: 'success', title: 'Salvo!', message: 'Seus dados foram atualizados.' });

// Modal (elemento <dialog class="modal modal--info" id="meu-modal">)
openModal('meu-modal');
closeModal('meu-modal');
```

No HTML, também é possível usar atributos: `data-modal-open="id"`, `data-modal-close`, `data-toast="success"` (com `data-toast-title` e `data-toast-message`) e `data-alert-close`.

## Design tokens

Definidos como variáveis CSS em `:root` (`css/styles.css`).

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#0b5fff` | Cabeçalho, links, foco de campos |
| `--color-primary-dark` | `#0847bf` | Menu, hover de links |
| `--color-secondary` | `#00805b` | Botões e sucesso |
| `--color-secondary-dark` | `#00634a` | Hover de botões e campo válido |
| `--color-accent` | `#f2a900` | Contorno de foco e avisos |
| `--color-error` | `#c62828` | Erros e campos inválidos |

Também há escalas de neutros, espaçamento (`--space-1` a `--space-7`), tipografia e raio de borda.

## Responsividade

Grid de 12 colunas com breakpoints mobile-first em 576px, 768px, 992px, 1200px e 1400px. O menu alterna entre hambúrguer e dropdown em 768px.

## Práticas de HTML5 semântico e acessibilidade aplicadas

Elementos semânticos: uso de header, nav, main, section, article, footer e dialog no lugar de divs genéricas, refletindo a estrutura real do conteúdo.

Atributos ARIA: aria-label em elementos de navegação, aria-labelledby associando seções, artigos e modais aos seus títulos, aria-describedby nos modais, aria-expanded e aria-controls no menu, e aria-current na página atual.

Hierarquia de cabeçalhos: uso consistente de h1 a h3 respeitando a ordem lógica do conteúdo.

Formulários acessíveis (`#/cadastro`):
- Todo campo possui label associado ao seu id via atributo for.
- Uso de autocomplete (name, bday, email, tel, postal-code) para facilitar o preenchimento.
- Uso de inputmode e pattern para orientar o tipo de teclado e validar formatos (CPF, CEP, telefone).
- Agrupamento de campos relacionados com fieldset e legend.
- Validação visual com cor, ícone e texto, sem depender apenas da cor.

Interação e movimento:
- Estados de foco visíveis (`:focus-visible`) com contorno em duas cores e adaptação ao modo de cores forçadas.
- Menu e submenu acessíveis por teclado, com botões nativos e fechamento por `Esc`.
- Modais nativos com foco preso, fechamento por `Esc` e retorno do foco ao elemento de origem.
- Toasts sem limite de leitura por padrão; durações explícitas pausam ao passar o mouse ou focar.
- `prefers-reduced-motion` desativa transições e animações.
- Alvos de toque com no mínimo 44px de altura.

Texto alternativo em imagens: atributo alt descritivo na imagem da página inicial.

Links descritivos: textos informativos em vez de "clique aqui", com rel="noopener noreferrer" em links externos que abrem em nova aba.

Navegação consistente: o menu principal está disponível em todas as páginas, com acesso ao Início.

O conteúdo principal recebe um nome pelo título da página. O link "Pular para o conteúdo" move o foco sem alterar a rota, e links para seções também posicionam o foco no destino. Formulários têm nome acessível; diálogos associam título e descrição e priorizam uma ação segura no foco inicial.

## Autor

Bryan Gabriel
- GitHub: github.com/Bryan-Gabriel
- LinkedIn: linkedin.com/in/bryan-gabriel

## Tecnologias utilizadas

HTML5 semântico, CSS3 (variáveis, Grid, Flexbox, media queries, transições e animações), JavaScript puro na aplicação principal, React e React DOM 19.2.4 via CDN em componentes de interface e boas práticas de acessibilidade web.

## Fluxo GitFlow

- `main`: versão estável, atualizada após revisão e merge do pull request.
- `develop`: integração das funcionalidades, com merges `--no-ff` para preservar a origem das mudanças.
- `feature/spa-modular-react`: criada a partir de `develop`, reúne os passos desta entrega em commits com tipo, escopo e descrição.
- `release/*`: preparação de versões quando houver um ciclo de lançamento separado.
- `hotfix/*`: correções urgentes originadas de `main` e posteriormente integradas também a `develop`.
