# OdontoFlow App Shell (HTML + CSS + JS puro)

## 1) O que é o shell
O App Shell é a camada de layout e navegação global da aplicação. Ele roda como entrypoint principal em `index.html` (raiz) e carrega as telas existentes via `<iframe>`. O arquivo `apps/web/app-shell/index.html` permanece apenas como redirecionamento de compatibilidade.

## 2) Responsabilidade do shell
**Shell controla navegação, telas controlam conteúdo.**

Responsabilidades do shell:
- montar layout principal (sidebar, header, área de conteúdo e bottom nav);
- controlar estado de aba ativa;
- trocar tela ativa alterando o `src` do iframe;
- responder a eventos globais de navegação (hash e `postMessage`).

## 3) Responsabilidade das telas
Cada tela HTML existente (`agenda`, `pacientes`, `financeiro`, etc.) continua responsável por:
- seu próprio HTML/CSS/JS interno;
- lógica de negócio local;
- renderização e interações internas.

O shell **não** deve duplicar ou mover lógica interna das telas.

## 4) Como adicionar nova tela
1. Criar a tela em `apps/web/src/<modulo>/<arquivo>.html` (com seus arquivos CSS/JS).
2. Adicionar um novo item em `NAV_ITEMS` no `shell.js`.
3. Validar o comportamento no desktop e mobile.
4. Se houver novo padrão visual, documentar em `docs/UI_GUIDELINES.md`.

Exemplo de item:
```js
{ id: 'novo-modulo', label: 'Novo módulo', src: './apps/web/src/novo-modulo/tela.html' }
```

## 5) Como funciona a navegação
- `renderSidebar()` monta navegação lateral (desktop).
- `renderBottomNav()` monta navegação inferior (mobile/tablet retrato).
- `navigateTo(tabId)` busca o item no `NAV_ITEMS` e troca o `src` do iframe.
- `setActiveState(tabId)` sincroniza estado ativo em sidebar e bottom nav.

## 6) Como funciona o iframe
- O iframe (`#app-frame`) sempre ocupa a área útil disponível.
- O shell mantém o histórico da navegação no hash (`#agenda`, `#patients`, etc.).
- O caminho de tela é normalizado para manter compatibilidade com o ponto de entrada principal na raiz do projeto.

## 7) Como comunicar telas (shell ↔ iframe)
O shell escuta mensagens com `window.addEventListener('message', ...)`.

Tela interna pode solicitar navegação assim:

```js
window.parent.postMessage({ type: 'navigate', payload: 'patients' }, '*');
```

Isso permite que telas disparem transição sem acoplamento com React ou backend.
