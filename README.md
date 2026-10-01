# ONG Acesso Digital

Projeto acadêmico desenvolvido para aplicar, na prática, HTML5 semântico, boas práticas de acessibilidade digital e uma camada de interface responsiva e interativa (menu, botões, formulários e componentes de feedback) na construção de páginas web para o terceiro setor.

## Acesso ao site

https://bryan-gabriel.github.io/inclusao-digital/

## Sobre o projeto

O site simula a página institucional de uma ONG fictícia chamada Acesso Digital, cuja missão é conscientizar desenvolvedores, empresas e instituições sobre a importância da acessibilidade na web.

## Instalação local e build de produção

Pré-requisitos: Node.js **22.12 ou superior** (Node 24 utilizado na validação e no CI) e npm.

```sh
git clone https://github.com/Bryan-Gabriel/inclusao-digital.git
cd inclusao-digital
npm ci
npm run dev
```

O servidor de desenvolvimento fica disponível em `http://127.0.0.1:5173`. `npm ci` instala as versões reproduzíveis registradas no `package-lock.json`.

```sh
npm run build       # gera dist/ com os arquivos de produção
npm run preview     # serve a build em http://127.0.0.1:4173
npm run medir:build # compara builds equivalentes com e sem minificação
```

- **Vite 8.3.1**, configurado em `vite.config.js`, empacota os módulos e as dependências React com Rolldown; Oxc minifica JavaScript e Lightning CSS minifica estilos.
- Um plugin de build usa **html-minifier-terser 7.2.0** para minificar `index.html` e os seis fragmentos de `html/` carregados por `fetch`. A opção `conservativeCollapse` conserva um espaço entre textos, e os atributos funcionais, IDs e nomes de classes são preservados.
- `base: './'` permite servir a build na raiz ou em um subdiretório. Imports dinâmicos continuam separados em chunks com nomes versionados por hash; não são gerados source maps de produção.
- Arquivos de `public/` são copiados para `dist/`; a imagem fica em `public/assets/images.jpg`. `node_modules/` e `dist/` são ignorados pelo Git.
- A aplicação agora deve ser executada pelo servidor do Vite ou pela build. React faz parte do pacote de produção, sem importação da CDN em tempo de execução.

Medição em bytes, sem gzip, entre duas builds de produção com as mesmas dependências e grafo de módulos:

| Tipo | Sem minificação | Minificado | Redução |
|---|---:|---:|---:|
| HTML | 29.286 | 20.959 | 28,43% |
| CSS | 47.149 | 36.854 | 21,84% |
| JavaScript, incluindo React | 521.176 | 211.258 | 59,47% |
| Total HTML + CSS + JS | 597.611 | 269.071 | 54,98% |

O comando de medição gera uma referência temporária sem minificação e a build final em `dist/`; imagens e compressão HTTP ficam fora da comparação. Os valores podem mudar ao editar o projeto.

Validação desta integração: build de produção aprovada, seis rotas e recursos conferidos na raiz e em um subdiretório, com checks focados de filtros React, perguntas, cadastro, modais, alto contraste, reflow a 320px e fallback quando um chunk React falha. O formulário manteve validação, máscaras e persistência; não houve erros JavaScript nem recursos HTTP 404 nos cenários normais.

Referências: [build no Vite](https://vite.dev/guide/build.html) e [html-minifier-terser](https://github.com/terser/html-minifier-terser).

## Publicação no GitHub Pages

O workflow `.github/workflows/build-pages.yml` executa `npm ci` e `npm run build` nos PRs e nas branches `main` e `develop`. A publicação de `dist/` ocorre somente na `main`, após a revisão e o merge, ou por execução manual do workflow na `main`.

Para usar essa publicação, selecione **Settings → Pages → Build and deployment → Source → GitHub Actions** no repositório. Publicar os arquivos-fonte diretamente pela branch não executa a build nem resolve as dependências npm. O workflow está preparado no código; a publicação remota depende dessa configuração e do merge na `main`.

## Funcionalidades

### Painel de participação com React

- Cartões na página inicial para voluntariado, capacitação e doações, com filtros por categoria.
- React e React DOM **19.2.4**, instalados via npm, com versões fixadas no manifesto e no lockfile, e empacotados pelo Vite.
- Estado do filtro controlado por `useState`, botões com `aria-pressed` e contagem de resultados anunciada por `role="status"`.
- Carregamento sob demanda; os cartões em HTML continuam acessíveis se o chunk React falhar.
- Ao sair da página inicial, o roteador dispara o `AbortController` e o componente é desmontado com `root.unmount()`.
- Perguntas expansíveis em Projeto e Contato e progresso do cadastro também usam componentes React.


### Navegação responsiva

- Menu horizontal com **dropdown** (submenu de "Projeto") em telas a partir de 768px.
- Menu **hambúrguer** em telas menores, com ícone desenhado apenas com CSS que se transforma em "X" ao abrir.
- Abordagem mobile-first: o CSS base descreve o menu condensado e a media query `@media (min-width: 768px)` o expande.
- Submenu controlado por um botão nativo, com `aria-expanded`, `aria-controls` e `hidden`; Enter ou Espaço alternam sua abertura e `Esc` devolve o foco ao botão.
- `aria-expanded` e `aria-controls` no botão, tecla `Esc` fecha o menu e `aria-current` destaca a página atual.

### Botões com estados interativos

Estados visuais distintos para `:hover` (fundo mais escuro, sombra e elevação), `:focus-visible` (contorno e halo em duas cores), `:active` (afundamento com sombra interna) e `:disabled` (aparência apagada e cursor bloqueado), com transições suaves. No alto contraste, o foco recebe contorno amarelo e as mudanças de cor são imediatas.

### Alto contraste

- O botão **Alto contraste**, no cabeçalho de todas as telas, alterna entre a paleta institucional e superfícies pretas com texto branco, links amarelos e bordas visíveis.
- Enter ou Espaço ativam o botão nativo; `aria-pressed` informa o estado aos leitores de tela, acompanhado de um indicador visível de ativação.
- `js/ui/contraste.js` aplica `data-contrast` à raiz da página. `css/contraste.css`, carregado após os demais estilos, adapta também formulários, filtros React, perguntas, progresso, alertas, notificações e modais.
- Sem escolha manual salva, acompanha `prefers-contrast: more` e suas mudanças. A escolha manual prevalece e fica em `ongad:contrast` no `localStorage`; se o armazenamento estiver bloqueado, a alternância continua funcionando na sessão.
- `forced-colors: active` respeita as cores do sistema, mantém foco e limites dos diálogos e adapta a barra de progresso. Mensagens de validação conservam texto e ícones além das cores.
- Para experimentar: execute o site por um servidor HTTP, ative o botão, navegue pelas páginas e recarregue. Acione novamente para restaurar a paleta padrão; remover `ongad:contrast` do armazenamento devolve a seleção automática ao sistema.

Rácios de texto medidos pelas cores computadas no Chrome, com a fórmula de luminância relativa WCAG, e inspeção `color-contrast` do axe-core:

| Elemento | Texto / fundo | Rácio |
|---|---|---|
| Cabeçalho padrão | `#ffffff` / `#0847bf` | 7,88:1 |
| Botão de sucesso padrão | `#ffffff` / `#00805b` | 4,95:1 |
| Texto, notificações e modais em alto contraste | `#ffffff` / `#000000` | 21:1 |
| Links em alto contraste | `#ffeb3b` / `#000000` | 17,20:1 |
| Filtro selecionado em alto contraste | `#000000` / `#ffeb3b` | 17,20:1 |
| Mensagem de erro em alto contraste | `#ffb4b4` / `#000000` | 12,44:1 |
| Mensagem de sucesso em alto contraste | `#a5f3b8` / `#000000` | 16,11:1 |

Os valores exibidos estão arredondados; o limite de 4,5:1 é comparado antes do arredondamento. As inspeções automáticas foram complementadas por verificações de teclado, persistência, preferências do sistema e layout a 320px. Isso não representa certificação integral WCAG nem teste com leitor de tela real. Referência: [WCAG 2.1, contraste mínimo](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).

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
├── index.html          # Estrutura da SPA, menu e entrada do Vite
├── package.json        # Dependências e comandos de desenvolvimento/build
├── package-lock.json   # Versões reproduzíveis das dependências
├── vite.config.js      # Empacotamento e minificação de HTML/CSS/JS
├── scripts/
│   └── medir-build.js  # Comparação de bytes antes/depois da minificação
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
│   ├── interface.css   # Aparência das telas, perguntas e progresso
│   └── contraste.css   # Controle e paleta de alto contraste
├── js/
│   ├── main.js         # Inicializa menu e roteador em JavaScript puro
│   ├── routes.js       # Define páginas e controladores sob demanda
│   ├── core/           # Roteador, templates, DOM, armazenamento e validação
│   ├── ui/             # Menu, contraste e feedback em JavaScript puro
│   ├── pages/
│   │   ├── home.js      # Carrega o componente React com tratamento de falhas
│   │   └── cadastro.js  # Controlador do formulário
│   └── components/
│       ├── participacao.js # Cartões e filtros
│       ├── perguntas.js # Perguntas expansíveis
│       └── progresso.js # Progresso do cadastro
└── public/
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

HTML5 semântico, CSS3 (variáveis, Grid, Flexbox, media queries, transições e animações), JavaScript puro na aplicação principal, React e React DOM 19.2.4 via npm, Vite 8.3.1 e html-minifier-terser 7.2.0 na build, e boas práticas de acessibilidade web.

## Fluxo GitFlow

- `main`: versão estável, atualizada após revisão e merge do pull request.
- `develop`: integração das funcionalidades, com merges `--no-ff` para preservar a origem das mudanças.
- `feature/spa-modular-react`: criada a partir de `develop`, reúne os passos desta entrega em commits com tipo, escopo e descrição.
- `feature/build-vite`: integração da build de produção e da publicação dos arquivos compilados, originada na `develop` atualizada com a `main`.
- `release/*`: preparação de versões quando houver um ciclo de lançamento separado.
- `hotfix/*`: correções urgentes originadas de `main` e posteriormente integradas também a `develop`.
