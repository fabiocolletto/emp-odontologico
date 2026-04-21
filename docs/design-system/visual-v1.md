# Design System Visual V1 (Oficial)

Status: **oficial e obrigatório** a partir de `v1.1.0`.

## 1. Objetivo

Transformar a base estrutural da V0 em uma fundação visual única, reutilizável e escalável para todo o app, sem CSS improvisado por tela.

## 2. Princípios visuais

- Limpo
- Profissional
- Silencioso
- Moderno
- Coerente com iOS/iPadOS em disciplina de densidade e interação
- Identidade própria do projeto (paleta OdontoFlow)

## 3. Tokens globais oficiais

Arquivo-fonte: `apps/web/styles.css`.

### 3.1 Cores
- `--color-brand-*`
- `--color-neutral-*`
- `--color-success-500`, `--color-warning-500`, `--color-danger-500`, `--color-info-500`

### 3.2 Superfícies e texto
- `--surface-page`, `--surface-solid`, `--surface-soft`, `--surface-elevated`, `--surface-overlay`
- `--text-strong`, `--text-base`, `--text-muted`, `--text-soft`, `--text-on-brand`

### 3.3 Bordas, raios e sombras
- `--border-*`
- `--radius-*`
- `--shadow-*`

### 3.4 Espaçamento, tipografia e ícones
- `--space-*`
- `--font-size-*`, `--font-family-sans`
- `--icon-size-*`

### 3.5 Larguras úteis e densidade
- `--content-max-width`
- `--density-header-height`
- `--density-body-padding`

### 3.6 Estados de interação
- `--state-focus-ring`
- `--state-hover-lift`
- `--state-disabled-opacity`

## 4. Componentes base oficiais

Implementados no CSS e com wrappers React em `apps/web/src/components.js`:

- Botões (`UiButton`)
- Campos (`UiInput`, `UiSelect`, `UiTextarea`, `UiSearchField`)
- Cartões (`UiCard`)
- Badges (`UiBadge`)
- Alertas (`UiAlert`)
- Empty state (`UiEmptyState`)
- Avatar (`UiAvatar`)
- Tabela base (`.ui-table-shell`, `.ui-table`)
- Skeleton (`UiSkeleton`)

## 5. Regras de composição e consistência

1. Não hardcodar cor, raio, sombra e spacing em telas novas.
2. Toda variação visual deve nascer por token/componente base.
3. Não duplicar componente com a mesma função visual.
4. Estados `hover/focus/disabled` devem usar tokens oficiais.
5. `framework-shell.css` mantém contrato estrutural V0; linguagem visual vive no design system.

## 6. O que deve ser preservado nas próximas fases

- Shell, breakpoints, navegação e níveis da V0.
- Tokens da V1 como fonte de verdade visual.
- Componentes base como primeira opção antes de criar variantes.
- Documentação atualizada a cada nova família de componente.

## 7. Estratégia de evolução

Prioridade contínua:
1. Fundação de tokens
2. Componentes base
3. Regras de composição
4. Aplicação incremental nas telas e módulos

