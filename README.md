# ONG Acesso Digital

Projeto acadêmico desenvolvido para aplicar, na prática, o uso correto de HTML5 semântico e boas práticas de acessibilidade digital na construção de páginas web.

## Acesso ao site

Substituir pelo link do GitHub Pages, ex: `https://seu-usuario.github.io/acesso-digital/`

## Sobre o projeto

O site simula a página institucional de uma ONG fictícia chamada Acesso Digital, cuja missão é conscientizar desenvolvedores, empresas e instituições sobre a importância da acessibilidade na web. O conteúdo e a estrutura das páginas foram pensados como exemplo de aplicação dos conceitos estudados em sala de aula.

## Estrutura de páginas

- `index.html` - Página inicial, com apresentação da ONG e navegação para as demais seções.
- `projeto.html` - Detalha a atuação da ONG: objetivos, como atuamos, voluntariado, doações e parcerias.
- `cadastro.html` - Formulário de cadastro de voluntários, com campos validados.
- `contact.html` - Página de contato com informações e links institucionais.

## Práticas de HTML5 semântico e acessibilidade aplicadas

Elementos semânticos: uso de header, nav, main, section, article e footer no lugar de divs genéricas, refletindo a estrutura real do conteúdo.

Atributos ARIA: aria-label em elementos de navegação e aria-labelledby associando seções e artigos aos seus respectivos títulos, para melhorar a leitura por leitores de tela.

Hierarquia de cabeçalhos: uso consistente de h1 a h3 respeitando a ordem lógica do conteúdo.

Formulários acessíveis (cadastro.html):
- Todo campo possui label associado ao seu id via atributo for.
- Uso de autocomplete (name, bday, email, tel, postal-code) para facilitar o preenchimento.
- Uso de inputmode e pattern para orientar o tipo de teclado e validar formatos (CPF, CEP, telefone).
- Agrupamento de campos relacionados com fieldset e legend.

Texto alternativo em imagens: atributo alt descritivo na imagem da página inicial.

Links descritivos: textos informativos em vez de "clique aqui", com rel="noopener noreferrer" em links externos que abrem em nova aba.

Navegação consistente: todas as páginas internas possuem um link de retorno para a página inicial.

## Autor

Bryan Gabriel
- GitHub: github.com/Bryan-Gabriel
- LinkedIn: linkedin.com/in/bryan-gabriel

## Tecnologias utilizadas

HTML5 semântico, CSS3 e boas práticas de acessibilidade web (WCAG).
