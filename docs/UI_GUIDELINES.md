# OdontoFlow UI Guidelines

## Visão geral
O OdontoFlow evolui como **framework de produto** (não como telas isoladas). A UI deve manter linguagem premium, limpa, com inspiração iOS/iPadOS para proporção, hierarquia, responsividade e estados de interação, sem cópia literal de componentes proprietários.

## Princípios visuais
1. Consistência acima de customização local.
2. Tokens primeiro; evitar valores hardcoded.
3. Hierarquia clara: shell → seção → card → conteúdo.
4. Superfícies leves, bordas suaves, sombras discretas.
5. Foco em produtividade (desktop) + ergonomia (tablet/mobile).

## Tokens oficiais
Fonte central: `apps/web/styles.css` (`:root`, variáveis `--of-*`).

Categorias obrigatórias:
- Cores, superfícies, texto.
- Bordas, sombras, blur, radius.
- Espaçamentos e tipografia.
- Layout (sidebar, max-width, touch-target).
- Motion e z-index.

Exemplos:
- `var(--of-primary)`
- `var(--of-radius-lg)`
- `var(--of-space-4)`
- `var(--of-touch-target)`

## Breakpoints oficiais
- **Mobile**: até `767px`
- **Tablet retrato**: `768px` a `1023px`
- **Tablet paisagem**: `1024px` a `1279px`
- **Desktop**: `1280px+`
- **Desktop amplo**: `1536px+`

## Shell oficial
Classes base:
- `.of-app-shell`
- `.of-sidebar`
- `.of-main`
- `.of-main-inner`
- `.of-page-header`
- `.of-page-body`
- `.of-page-actions`
- `.of-content-grid`

Diretrizes:
- Fundo geral: `--of-bg-app`.
- Conteúdo com largura confortável: `--of-content-max-width`.
- Sem overflow horizontal global.
- Sidebar fixa em desktop; drawer/overlay em mobile/tablet retrato.
- Em módulos HTML de nível 0/1, o contexto primário deve ser exibido no header do shell; headers internos das telas não devem existir.

## Níveis de navegação
Usar `data-nav-level` ou classes `.of-view-level-*`:
- Nível 0: visão geral/dashboard.
- Nível 1: lista/cadastro principal.
- Nível 2: detalhe/edição.
- Nível 3: seleção auxiliar/modal/drawer interno.

## Componentes oficiais
- **Card**: `.of-card`, `.of-card-header`, `.of-card-title`, `.of-card-subtitle`, `.of-card-body`, `.of-card-footer`
- **Botões**: `.of-button`, `.of-button--primary`, `.of-button--secondary`, `.of-button--ghost`, `.of-button--danger`, `.of-button--icon`
- **Segmented**: `.of-segmented`, `.of-segmented__button`, `.is-active`
- **KPI**: `.of-kpi-grid`, `.of-kpi-card`, `.of-kpi-header`, `.of-kpi-label`, `.of-kpi-value`, `.of-kpi-meta`
- **Chips**: `.of-chip`, `.of-chip--success|warning|danger|info|neutral`
- **Tabela/Lista**: `.of-table-wrap`, `.of-table`, `.of-list`, `.of-list-item`
- **Forms**: `.of-field`, `.of-label`, `.of-input`, `.of-select`, `.of-textarea`, `.of-helper-text`
- **Drawer**: `.of-drawer`, `.of-drawer-overlay`, `.of-drawer-panel`
- **Modal**: `.of-modal`, `.of-modal-panel`, `.of-modal-header`, `.of-modal-body`, `.of-modal-footer`
- **Empty state**: `.of-empty-state`, `.of-empty-state-title`, `.of-empty-state-text`
- **Page header**: `.of-page-header`, `.of-page-kicker`, `.of-page-title`, `.of-page-description`, `.of-page-actions`
- **Bottom nav mobile (shell)**: botões lado a lado, estilo `icon-first` (ícone principal + rótulo secundário), até 5 itens visíveis sem rolagem (ou 4 em telas muito pequenas) e rolagem horizontal apenas quando exceder esse limite.

## Regras para novas telas
1. Definir nível de navegação (`data-nav-level`).
2. Compor com shell oficial e componentes oficiais.
3. Não criar nova classe visual se existir equivalente.
4. Criar variações por modificador (`--primary`, `--compact`, etc.).
5. Não usar cor/sombra/radius/spacing fora de tokens.

## Procedimento para criar uma nova tela
1. Identificar o nível da tela:
   - Nível 0: dashboard.
   - Nível 1: lista/cadastro.
   - Nível 2: detalhe/edição.
   - Nível 3: seleção/modal/picker.
2. Usar o shell oficial:
   - `.of-app-shell`
   - `.of-main`
   - `.of-main-inner`
   - `.of-page-header`
   - `.of-page-body`
3. Usar componentes oficiais:
   - `.of-card`
   - `.of-button`
   - `.of-segmented`
   - `.of-chip`
   - `.of-table`
   - `.of-field`
   - `.of-empty-state`
4. Não criar classe nova se já existir equivalente.
5. Para variação, criar modificador.
6. Usar sempre tokens `--of-*`.
7. Validar responsividade em mobile/tablet/desktop.
8. Validar acessibilidade (foco, contraste, labels, teclado).
9. Atualizar esta documentação ao criar novo padrão.
10. Não adicionar CDN/biblioteca sem justificativa e registro.

## Padrão oficial de telas HTML modulares (nível 0 e 1)
Para evolução incremental via shell React + arquivos independentes:

1. Criar trio por tela em `apps/web/src/<modulo>/`:
   - `<tela>.html`
   - `<tela>.css`
   - `<tela>.js`
2. Declarar nível com `data-nav-level` e `.of-view-level-*` no `<main>`.
3. Expor no JS um factory global `create*LegacyFrame` para o shell React montar via `<iframe>`.
4. Garantir modo standalone: se existir root `[data-*-app]`, executar render local automático.
5. Preservar seção de rastreabilidade de legados em `[data-legacy="true"]`, ocultando automaticamente quando não houver pendências.
6. Registrar script da tela em `index.html` antes do bootstrap React.

## Regras para alterar componentes existentes
- Alterações em componentes oficiais devem ser backward compatible sempre que possível.
- Evitar renomear classes sem plano de migração.
- Não duplicar componentes com mesmo papel visual.

## Regras para evitar duplicação
- Pesquisar primeiro por `.of-*` existente.
- Reusar componentes shared (`apps/web/src/shared`) quando possível.
- Se necessário novo componente, documentar motivação e contrato.

## Checklist de revisão visual
- Hierarquia visual consistente.
- Espaçamentos alinhados aos tokens.
- Componentes com estados normal/hover/active/focus.
- Sem excesso de bordas/sombras.

## Checklist de acessibilidade
- Foco visível.
- Contraste legível.
- `type="button"` quando aplicável.
- `aria-label` em botões icônicos.
- Estados não dependem só de cor.
- Navegação por teclado funcional.

## Checklist de responsividade
- Desktop: sidebar fixa, KPIs em 3 colunas.
- Tablet paisagem: conteúdo confortável, sem densidade excessiva.
- Tablet retrato: 1–2 colunas, navegação compacta/drawer.
- Mobile: 1 coluna, toque confortável, sem overflow global.

## Exemplo de estrutura HTML (nova tela)
```html
<main class="of-main-inner of-view-level-1" data-nav-level="1">
  <header class="of-page-header">
    <div>
      <p class="of-page-kicker">Módulo</p>
      <h1 class="of-page-title">Título da tela</h1>
      <p class="of-page-description">Descrição curta</p>
    </div>
    <div class="of-page-actions">
      <button type="button" class="of-button of-button--secondary">Cancelar</button>
      <button type="button" class="of-button of-button--primary">Salvar</button>
    </div>
  </header>
  <section class="of-page-body">
    <article class="of-card">
      <div class="of-card-header"><h2 class="of-card-title">Seção</h2></div>
      <div class="of-card-body">Conteúdo</div>
    </article>
  </section>
</main>
```

## Exemplo KPI/Card/Tabela
```html
<section class="of-kpi-grid">
  <article class="of-card of-kpi-card">
    <header class="of-kpi-header">
      <p class="of-kpi-label">Receita</p>
      <p class="of-kpi-value">R$ 12.400</p>
      <p class="of-kpi-meta">+8% vs mês anterior</p>
    </header>
  </article>
</section>

<div class="of-table-wrap">
  <table class="of-table">
    <thead><tr><th>Paciente</th><th>Status</th></tr></thead>
    <tbody><tr><td>Maria</td><td><span class="of-chip of-chip--success">Ativo</span></td></tr></tbody>
  </table>
</div>
```

## Shell HTML oficial incremental (`apps/web/app-shell`)
Para migração progressiva do shell React para shell em HTML/CSS/JS puro:

1. Novo entrypoint oficial de deploy: `index.html` (raiz), carregando `apps/web/app-shell/shell.js` e demais assets do shell.
2. O shell controla somente layout e navegação global.
3. Conteúdo de cada módulo deve continuar isolado em `apps/web/src/**`.
4. Navegação entre módulos deve ocorrer por troca de `iframe src`, sem mover lógica interna das telas.
5. Para integração entre tela e shell, usar `window.parent.postMessage({ type: 'navigate', payload: '<tab-id>' }, '*')`.
6. Manter `apps/web/app-shell/index.html` apenas como redirecionamento de compatibilidade para o entrypoint principal.

## Camada shared obrigatória para novas UIs
Antes de criar novo componente visual ou serviço de suporte em tela HTML, consultar:
1. `apps/web/shared/registry/component-registry.js`
2. `apps/web/shared/registry/service-registry.js`
3. `apps/web/shared/registry/README.md`

Diretriz de reuso:
- Reutilizar primeiro `page-header`, `filter-panel`, `date-range-picker`, `modal`, `drawer`, `status-badge`, `empty-state` e `action-bar`.
- Auth/Sessão/Clínica/Storage/Eventos devem usar serviços da camada `apps/web/shared/services`.
