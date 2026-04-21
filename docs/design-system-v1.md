# Design System Visual Oficial — V1

Status: **oficial (V1)**  
Data: **2026-04-21**

Este documento consolida a fundação visual do projeto sobre o framework estrutural da V0. A partir desta versão, novos módulos devem reutilizar tokens, componentes base e regras de composição descritas aqui.

## 1) Princípios visuais

- Linguagem limpa, silenciosa e profissional.
- Contraste alto para leitura e contraste moderado para superfícies.
- Variações por estado e densidade guiadas por tokens, sem valores visuais “soltos”.
- Reuso de componentes base em vez de CSS ad-hoc por tela.

## 2) Fundação oficial de tokens

Fonte oficial: `apps/web/styles.css`.

### 2.1 Cores e superfícies

- App background: `--ds-color-bg-app`
- Surface principal: `--ds-color-bg-surface`
- Surface secundária: `--ds-color-bg-surface-soft`
- Surface muted: `--ds-color-bg-surface-muted`
- Acento principal: `--ds-color-bg-accent`
- Acento forte: `--ds-color-bg-accent-strong`

### 2.2 Tipografia e texto

- Texto forte/base/muted/soft:
  - `--ds-color-text-strong`
  - `--ds-color-text-base`
  - `--ds-color-text-muted`
  - `--ds-color-text-soft`
- Escala base:
  - `--ds-font-label`
  - `--ds-font-caption`
  - `--ds-font-body`
  - `--ds-font-title`

### 2.3 Bordas, raios, sombras

- Bordas: `--ds-color-border-subtle`, `--ds-color-border-soft`
- Raios: `--ds-radius-sm`, `--ds-radius-md`, `--ds-radius-lg`, `--ds-radius-pill`
- Sombras: `--ds-shadow-xs`, `--ds-shadow-sm`, `--ds-shadow-md`

### 2.4 Espaçamentos e ícones

- Espaçamentos: `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-space-5`, `--ds-space-6`, `--ds-space-8`
- Ícones: `--ds-icon-sm`, `--ds-icon-md`, `--ds-icon-lg`

### 2.5 Estados de interação e foco

- Cor de foco padrão: `--ds-color-focus`
- Hover/elevation de card: `.ds-kpi-card:hover`
- Disabled de field: `.ds-field__control.is-disabled`

### 2.6 Densidade por breakpoint

- Breakpoints estruturais mantidos conforme V0 (mobile/tablet/desktop).
- Componentes V1 priorizam densidade compacta no mobile e aumentam espaçamento em contextos amplos via `clamp()` e tokens.

## 3) Componentes base oficiais (V1)

Implementados/normalizados em `apps/web/styles.css` e consumidos em `apps/web/src/components.js` e `apps/web/src/app.js`.

- **Botões:** sistema `ui-btn` como base oficial.
- **Fields:** `ds-field`, `ds-field__*`.
- **Cards:** `ds-card` e `ds-kpi-card`.
- **Section header:** `ds-section-header` + `ds-action-bar`.
- **Badges/Chips:** `ds-badge` + variantes (`--success`, `--danger`, `--warning`).
- **Empty state:** `ds-empty-state-shell`, `ds-empty-state`.
- **Loading/Skeleton base:** `ds-loading-screen`, `ds-spinner`.

## 4) Regras de composição visual

1. Não aplicar cor, sombra, raio ou spacing hardcoded em novos componentes se já houver token equivalente.
2. Todo componente reutilizável deve iniciar por uma classe `ds-*` (ou `ui-*` para sistema de botão legado oficial).
3. Ajustes visuais pontuais devem ser feitos por variante (`--danger`, `--warning`, etc.), não por cópia de bloco CSS.
4. Não criar estilos concorrentes para o mesmo papel visual (ex.: dois padrões de card primário).
5. O framework de layout V0 (shell/breakpoints/níveis) é intocável, salvo ajustes pontuais de consistência.

## 5) Aplicação progressiva executada nesta V1

Ordem usada:

1. Fundação global de tokens (`:root` + bloco V1 em `styles.css`).
2. Normalização de primitivas base (`ds-card`, `ds-badge`, `ds-field`, `ds-section-header`).
3. Adoção direta em componentes centrais (`FormField`, `KpiCard`, `AdaptiveHeader`).
4. Adoção no fluxo de entrada/onboarding (`App` com loading + empty state oficiais).

## 6) Preservação para próximas fases

- Novos módulos devem nascer já em cima dos componentes/tokens V1.
- Qualquer novo componente visual oficial deve entrar neste documento.
- Se houver exceção visual, registrar o motivo e o prazo de convergência.

## 7) Limites da V1

- Não foram introduzidas novas features de negócio.
- Não houve redefinição estrutural do shell V0.
- A fase focou em consolidar contrato visual oficial e base de reuso para expansão de módulos.
