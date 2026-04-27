# Framework de Layout do App (Base Oficial)

Este documento define o contrato oficial do framework estrutural do app.  
Ele deve ser preservado e evoluído, **não recriado por tela**.

> Auditoria estrutural de referência: `docs/framework-checkup.md`.
> Plano de fechamento da versão 0: `docs/v0-framework-finalization-plan.md`.
> Design system visual oficial (V1): `docs/design-system/visual-v1.md`.
> Status: versão 0 do framework fechada; ciclo de aplicação iniciado em `v1.0.0`.

## 1) Objetivo

Padronizar a arquitetura visual e de navegação para:

- shell único reutilizável;
- comportamento consistente por breakpoint;
- profundidade de navegação explícita (níveis 0, 1, 2, 3);
- componentes estruturais oficiais (tab bar, sidebar, detail pane, drawer, sheet, overlay).

## 2) Shell base obrigatório

Estrutura base:

- `.app-shell`
- `.app-main`
- `.app-header`
- `.app-body`
- `.app-footer`

Com sidebar ativa (layouts amplos):

- `.app-shell.app-shell--wide`
- `.app-sidebar`
- `.app-main`

Regra global:

- **`app-body` é a região principal de scroll**.
- shell geral não deve rolar.

## 3) Breakpoints oficiais

- **Mobile:** `0px` a `599px`
- **Tablet:** `600px` a `1023px`
- **Desktop:** `1024px+`

Subcomportamento de tablet:

- **Tablet retrato:** mantém lógica compact (tab bar).
- **Tablet paisagem:** entra em lógica wide (sidebar).

## 4) Comportamento por breakpoint

### Mobile (compact)
- header fixo
- body scrollável
- bottom navigation ativa
- sem sidebar

### Tablet retrato (compact arejado)
- mantém bottom navigation
- sem sidebar
- maior densidade de espaço (header/body mais arejados)

### Tablet paisagem (wide)
- sidebar ativa (nível 0)
- bottom navigation oculta
- body principal à direita

### Desktop (wide)
- sidebar fixa (nível 0)
- sem bottom navigation
- header funcional + body principal

## 5) Níveis de navegação (contrato)

- **Nível 0:** navegação estrutural (`bottom-tabbar` em compact / `app-sidebar` em wide).
- **Nível 1:** módulo/lista/área principal (conteúdo em `app-body`, `ViewLayout`).
- **Nível 2:** detalhe/editor (`DetailPane`, split/lateral em wide; tela/sheet em compact).
- **Nível 3:** tarefa auxiliar contextual (`AppDrawer`, `AppSheet`, overlay contextual).

Convenções implementadas:

- `data-shell-level="0"` no shell
- `data-shell-level="1"` no body
- `data-level="1|2|3"` nos containers de nível

## 6) Componentes estruturais oficiais

- **Bottom navigation:** `.bottom-tabbar` (somente compact).
- **Sidebar:** `.app-sidebar` + `__header`, `__nav`, `__footer` (somente wide).
- **Detail pane:** `.detail-pane` (nível 2 em wide).
- **Drawer:** `.app-drawer` (nível 3 contextual).
- **Sheet:** `.app-sheet` (nível 3 contextual).
- **Overlay:** `.app-overlay` + `.app-overlay__backdrop`.
- **Header/Body estruturais:** `.app-header`, `.app-body`.

## 6.1) Localização oficial da infraestrutura

- Entrada atual do app no `index.html` (raiz), com shell HTML/CSS/JS puro.
- Código modular em `apps/web/src` permanece como base de evolução do framework.
- Tokens e estilos oficiais: `apps/web/styles.css`.
- Estilos/comportamento do shell: `apps/web/app-shell/shell.css` e `apps/web/app-shell/shell.js`.

## 7) Regras de preservação (contrato de continuidade)

1. Não recriar shell por página.
2. Não criar footer alternativo em telas comuns.
3. Não quebrar a navegação principal por breakpoint.
4. Não duplicar padrões de header estrutural.
5. Não transformar nível 3 em tela inteira sem necessidade.
6. Respeitar a profundidade dos níveis 0/1/2/3.
7. Evoluir componentes estruturais existentes em vez de criar versões paralelas.
8. Tratar este framework como base oficial para os próximos miniapps.

## 8) Diretriz para futuras telas

Toda nova tela deve:

- entrar dentro de `app-body`;
- reutilizar navegação principal do shell (tab bar/sidebar);
- usar `DetailPane`, `AppDrawer` e `AppSheet` quando precisar de níveis 2 e 3;
- evitar implementar arquiteturas paralelas sem necessidade.
